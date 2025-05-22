const Message = require('./messagemodel');
const Chat = require('./chatmodel');
const { getIO } = require('../sockets/chatSocket');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, attachments = [], replyTo } = req.body;
    const senderId = req.user.userId;
    const senderModel = req.user.userType === 'User' ? 'User' : 'Business';

    console.log('--- sendMessage Request Details ---');
    console.log('chatId:', chatId);
    console.log('content:', content);
    console.log('attachments:', attachments);
    console.log('replyTo:', replyTo);
    console.log('senderId (from req.user):', senderId);
    console.log('senderModel (from req.user):', senderModel);
    console.log('---------------------------------');

    if (!chatId || (!content && attachments.length === 0)) {
      console.error('Validation Error: Chat ID and content or attachments are required.');
      return res.status(400).json({ error: 'Chat ID and content or attachments are required' });
    }

    // Validate chat exists and user is a participant
    console.log('Attempting to find chat...');
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.participant': senderId,
      'deletedFor.user': { $ne: senderId }
    });

    if (!chat) {
      console.error(`Authorization Error: Chat with ID ${chatId} not found or user ${senderId} is not a participant/chat is deleted.`);
      return res.status(403).json({ error: 'You are not a participant in this chat or chat is deleted' });
    }
    console.log('Chat found:', chat._id);

    // Find or create the parent Message document for this chat
    console.log('Attempting to find or create parent Message document for chat...');
    let chatMessagesDoc = await Message.findOne({ chat: chatId });

    if (!chatMessagesDoc) {
      // If no Message document exists for this chat, create one
      chatMessagesDoc = new Message({ chat: chatId, messages: [] });
      console.log('Created new parent Message document for chat:', chatId);
    }

    // Create the new message subdocument
    const newMessageSubdocument = {
      sender: senderId,
      senderModel,
      content,
      attachments,
      replyTo, // replyTo is now the _id of the subdocument it's replying to
      readBy: [{
        reader: senderId,
        readerModel: senderModel,
        readAt: new Date()
      }]
    };

    // Add the new message to the messages array
    chatMessagesDoc.messages.push(newMessageSubdocument);

    console.log('Saving parent Message document with new subdocument...');
    await chatMessagesDoc.save();

    // After saving, the subdocument in the array will have its _id
    const savedMessageSubdocument = chatMessagesDoc.messages[chatMessagesDoc.messages.length - 1];
    const newSubdocumentId = savedMessageSubdocument._id; // Get the ID from the saved subdocument instance

    console.log('Parent Message document saved. New subdocument ID:', newSubdocumentId);

    // --- Re-fetch and Populate the specific new message ---
    console.log('Re-fetching and populating the new message...');
    const populatedChatMessagesDoc = await Message.findOne({ chat: chatId })
      .populate({
        path: 'messages.sender', // Directly target the nested sender path using dot notation
        select: 'username profilePic'
      });

    if (!populatedChatMessagesDoc) {
      // This should ideally not happen if chatMessagesDoc was just saved
      throw new Error('Failed to re-fetch chat messages document after saving.');
    }

    // Find the newly added message subdocument from the re-fetched and populated document
    let populatedNewMessage = populatedChatMessagesDoc.messages.find(msg => msg._id.equals(newSubdocumentId));

    if (!populatedNewMessage) {
      console.error('CRITICAL ERROR: Newly added message subdocument not found after re-fetch and populate.');
      // Added more debug info here:
      console.error('Expected newSubdocumentId:', newSubdocumentId);
      console.error('IDs in populatedChatMessagesDoc.messages:', populatedChatMessagesDoc.messages.map(m => m._id));
      throw new Error('Failed to locate the newly sent message after processing.');
    }

    // Handle replyTo population manually
    if (populatedNewMessage.replyTo) {
      // Find the replied-to message subdocument within the same chatMessagesDoc
      const repliedToMessageSubdocument = populatedChatMessagesDoc.messages.find(msg => msg._id.equals(populatedNewMessage.replyTo));

      if (repliedToMessageSubdocument) {
        // Create a temporary Mongoose document to leverage populate on the subdocument's sender
        // This is a common workaround for populating nested subdocuments
        const TempMessageModel = mongoose.model('TempMessage', new mongoose.Schema({
          sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel' },
          senderModel: String,
          content: String
        }));
        const tempDoc = new TempMessageModel(repliedToMessageSubdocument.toObject());

        await tempDoc.populate({
          path: 'sender',
          select: 'username profilePic'
        });
        populatedNewMessage.replyTo = tempDoc; // Assign the populated tempDoc to replyTo
      } else {
        console.warn(`Replied-to message with ID ${populatedNewMessage.replyTo} not found in chat ${chatId}.`);
        populatedNewMessage.replyTo = null; // Clear if not found
      }
    }
    console.log('Message populated successfully.');

    // Update chat with latest message info
    console.log('Updating chat last message and unread counts...');
    chat.lastMessage = {
      messageId: savedMessageSubdocument._id, // Use the subdocument's ID
      sender: senderId,
      content: content ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : '[Attachment]',
      timestamp: savedMessageSubdocument.createdAt
    };

    // Increment unread count for other participants
    chat.unreadCounts.forEach(uc => {
      if (uc.participant.toString() !== senderId.toString()) {
        uc.count += 1;
      }
    });

    await chat.save();
    console.log('Chat updated successfully.');

    // Emit message to all chat participants via Socket.IO
    console.log('Attempting to emit message via Socket.IO...');
    const io = getIO();
    if (io) {
      chat.participants.forEach(participant => {
        io.to(participant.participant.toString()).emit('messageReceived', {
          chatId,
          message: populatedNewMessage.toObject({ getters: true, virtuals: false }) // Ensure it's a plain object for socket emission
        });
        console.log(`Emitted message to participant: ${participant.participant.toString()}`);
      });
      console.log('Message emission complete.');
    } else {
      console.warn('Socket.IO instance (io) is not available. Message will not be emitted via sockets.');
    }

    res.status(201).json(populatedNewMessage.toObject({ getters: true, virtuals: false }));
  } catch (error) {
    console.error('--- Error sending message ---');
    console.error('Error details:', error);
    if (error.name === 'ValidationError') {
      console.error('Mongoose Validation Error:', error.message);
      res.status(400).json({ error: 'Validation failed', details: error.message });
    } else if (error.name === 'CastError') {
      console.error('Mongoose Cast Error (e.g., invalid ID format):', error.message);
      res.status(400).json({ error: 'Invalid ID format', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
  }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log('--- getMessages Request Details ---');
    console.log('chatId:', chatId);
    console.log('userId:', userId);
    console.log('page:', page);
    console.log('limit:', limit);
    console.log('skip:', skip);
    console.log('---------------------------------');

    // Check if user is a participant in the chat
    console.log('Checking chat participation...');
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      console.error(`Authorization Error: Chat with ID ${chatId} not found or user ${userId} is not a participant/chat is deleted.`);
      return res.status(403).json({ error: 'You are not a participant in this chat or chat is deleted' });
    }
    console.log('User is a participant in chat:', chat._id);

    // Find the parent Message document for this chat
    console.log('Fetching parent Message document...');
    const chatMessagesDoc = await Message.findOne({ chat: chatId });

    if (!chatMessagesDoc) {
      console.log('No messages found for this chat.');
      return res.json([]); // Return empty array if no messages document exists
    }

    // Filter messages based on 'deletedFor' and apply pagination
    // Mongoose's .find() on subdocuments with populate is tricky.
    // The most robust way is to fetch the parent document, then filter/sort/paginate the subdocuments in memory.
    let filteredMessages = chatMessagesDoc.messages.filter(msg => {
      // Check if the message is deleted for the current user
      const isDeletedForUser = msg.deletedFor.some(df => df.user.equals(userId));
      return !isDeletedForUser;
    });

    // Sort messages by createdAt in descending order (newest first)
    // Note: If you have a very large number of messages in a single array,
    // sorting/skipping/limiting in memory can be inefficient.
    // For very large chats, you might need a different schema (e.g., individual message documents).
    filteredMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply skip and limit for pagination
    const paginatedMessages = filteredMessages.slice(skip, skip + limit);

    // --- Manual Population for sender and replyTo within the paginated messages ---
    console.log('Manually populating sender and replyTo for paginated messages...');
    const populatedMessages = [];

    // Define TempMessageModel outside the loop and check if it already exists
    let TempMessageModel;
    try {
      TempMessageModel = mongoose.model('TempMessageForPopulate');
    } catch (error) {
      // If the model does not exist, define it
      TempMessageModel = mongoose.model('TempMessageForPopulate', new mongoose.Schema({
        sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel' },
        senderModel: String,
        content: String // Include other fields that might be needed for replyTo content
      }));
    }

    for (const msg of paginatedMessages) {
      // Create a temporary Mongoose document to leverage populate for the sender
      const tempMsgDoc = new TempMessageModel(msg.toObject()); // Convert subdocument to plain object then to temp Mongoose doc

      await tempMsgDoc.populate({
        path: 'sender',
        select: 'username profilePic'
      });

      // Handle replyTo population manually
      if (msg.replyTo) {
        const repliedToMessageSubdocument = chatMessagesDoc.messages.find(
          m => m._id.equals(msg.replyTo)
        );

        if (repliedToMessageSubdocument) {
          const tempRepliedToDoc = new TempMessageModel(repliedToMessageSubdocument.toObject());
          await tempRepliedToDoc.populate({
            path: 'sender',
            select: 'username profilePic'
          });
          tempMsgDoc.replyTo = tempRepliedToDoc;
        } else {
          console.warn(`Replied-to message with ID ${msg.replyTo} not found in chat ${chatId}.`);
          tempMsgDoc.replyTo = null;
        }
      }

      populatedMessages.push(tempMsgDoc.toObject({ getters: true, virtuals: false }));
    }

    console.log('Messages fetched and populated successfully.');
    res.json(populatedMessages);

  } catch (error) {
    console.error('--- Error fetching messages ---');
    console.error('Error details:', error);
    if (error.name === 'CastError') {
      console.error('Mongoose Cast Error (e.g., invalid ID format):', error.message);
      res.status(400).json({ error: 'Invalid ID format', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
    }
  }
};


// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    console.log('--- markAsRead Request Details ---');
    console.log('chatId:', chatId);
    console.log('userId:', userId);
    console.log('userModel:', userModel);
    console.log('---------------------------------');

    if (!chatId) {
      console.error('Validation Error: Chat ID is required.');
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    // Check if chat exists and user is a participant
    console.log('Checking chat participation...');
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      console.error(`Authorization Error: Chat with ID ${chatId} not found or user ${userId} is not a participant/chat is deleted.`);
      return res.status(403).json({ error: 'You are not a participant in this chat or chat is deleted' });
    }
    console.log('User is a participant in chat:', chat._id);

    // Find the parent Message document for this chat
    console.log('Fetching parent Message document to mark messages as read...');
    const chatMessagesDoc = await Message.findOne({ chat: chatId });

    if (!chatMessagesDoc) {
      console.log('No messages document found for this chat. Nothing to mark as read.');
      return res.json({ success: true, readCount: 0 });
    }

    let modifiedCount = 0;

    // Iterate through messages and mark them as read for the current user
    chatMessagesDoc.messages.forEach(message => {
      // Check if the user has already read this specific message
      const alreadyRead = message.readBy.some(
        readReceipt => readReceipt.reader.equals(userId)
      );

      if (!alreadyRead) {
        // If not already read, add the read receipt
        message.readBy.push({
          reader: userId,
          readerModel: userModel,
          readAt: new Date()
        });
        modifiedCount++;
      }
    });

    // Save the updated parent Message document
    if (modifiedCount > 0) {
      console.log(`Marked ${modifiedCount} messages as read. Saving parent Message document...`);
      await chatMessagesDoc.save();
      console.log('Parent Message document saved.');
    } else {
      console.log('No new messages to mark as read for this user.');
    }

    // Reset unread count for this user in the Chat document
    console.log('Resetting unread count for user in Chat document...');
    const unreadIndex = chat.unreadCounts.findIndex(
      uc => uc.participant.toString() === userId.toString()
    );

    if (unreadIndex !== -1) {
      if (chat.unreadCounts[unreadIndex].count > 0) {
        chat.unreadCounts[unreadIndex].count = 0;
        await chat.save();
        console.log('Unread count reset successfully.');
      } else {
        console.log('Unread count already zero for this user.');
      }
    } else {
      console.warn('User not found in unreadCounts array. This might indicate a data inconsistency.');
    }

    // Notify other participants via socket.io
    console.log('Notifying other participants via Socket.IO...');
    const io = getIO();
    if (io) {
      chat.participants.forEach(participant => {
        if (participant.participant.toString() !== userId.toString()) {
          io.to(participant.participant.toString()).emit('messagesRead', {
            chatId,
            userId,
            readCount: modifiedCount // Send the actual number of messages marked as read
          });
          console.log(`Emitted 'messagesRead' to participant: ${participant.participant.toString()}`);
        }
      });
      console.log('Socket.IO notification complete.');
    } else {
      console.warn('Socket.IO instance (io) is not available. Read receipts will not be emitted via sockets.');
    }

    res.json({ success: true, readCount: modifiedCount });
  } catch (error) {
    console.error('--- Error marking messages as read ---');
    console.error('Error details:', error);
    if (error.name === 'CastError') {
      console.error('Mongoose Cast Error (e.g., invalid ID format):', error.message);
      res.status(400).json({ error: 'Invalid ID format', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to mark messages as read', details: error.message });
    }
  }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    // Find the message
    const message = await Message.findOne({
      _id: messageId,
      'deletedFor.user': { $ne: userId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or already deleted' });
    }

    // Check if user is a participant in the chat
    const chat = await Chat.findOne({
      _id: message.chat,
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      return res.status(403).json({ error: 'You are not a participant in this chat or chat is deleted' });
    }

    // Add user to deletedFor array
    if (!message.deletedFor.some(df => df.user.toString() === userId.toString())) {
      message.deletedFor.push({ 
        user: userId, 
        userModel,
        deletedAt: new Date()
      });
      await message.save();
    }

    // If all participants have deleted the message, hard delete it
    const allParticipantsDeleted = chat.participants.every(participant => 
      message.deletedFor.some(df => df.user.toString() === participant.participant.toString())
    );

    if (allParticipantsDeleted) {
      await Message.findByIdAndDelete(messageId);
      
      // Update chat's last message if this was the last message
      if (chat.lastMessage && chat.lastMessage.messageId.toString() === messageId.toString()) {
        const previousMessage = await Message.findOne({ chat: message.chat })
          .sort({ createdAt: -1 })
          .limit(1);
        
        if (previousMessage) {
          chat.lastMessage = {
            messageId: previousMessage._id,
            sender: previousMessage.sender,
            content: previousMessage.content.length > 50 
              ? previousMessage.content.substring(0, 50) + '...' 
              : previousMessage.content,
            timestamp: previousMessage.createdAt
          };
        } else {
          chat.lastMessage = null;
        }
        
        await chat.save();
      }
    }

    // Notify participants via socket.io
    const io = getIO();
    chat.participants.forEach(participant => {
      io.to(participant.participant.toString()).emit('messageDeleted', { 
        chatId: message.chat,
        messageId,
        deletedBy: userId
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params; // messageId is the _id of the subdocument
    const { content } = req.body;
    const userId = req.user.userId; // userId of the authenticated sender

    console.log('--- editMessage Request Details ---');
    console.log('messageId:', messageId);
    console.log('content:', content);
    console.log('userId (from req.user):', userId);
    console.log('---------------------------------');

    if (!content) {
      console.error('Validation Error: Content is required for editing.');
      return res.status(400).json({ error: 'Content is required' });
    }

    // 1. Find the parent Message document that contains the subdocument
    // We need to find the document where one of its 'messages' subdocuments matches the messageId
    // and also ensure the sender of that specific subdocument is the current userId,
    // and it's not deleted for this user.
    console.log('Attempting to find parent Message document and specific subdocument...');
    const parentMessageDoc = await Message.findOne({
      'messages._id': messageId,
      'messages.sender': userId, // Ensure the sender of the subdocument matches userId
      'messages.deletedFor.user': { $ne: userId } // Ensure the message is not deleted for this user
    });

    if (!parentMessageDoc) {
      console.error(`Authorization/Existence Error: Message with ID ${messageId} not found, user ${userId} is not the sender, or message is deleted.`);
      return res.status(404).json({ error: 'Message not found, you are not the sender, or message is deleted' });
    }
    console.log('Parent Message document found:', parentMessageDoc._id);

    // 2. Locate the specific subdocument and update it
    const messageSubdocument = parentMessageDoc.messages.id(messageId); // Mongoose helper to find subdocument by _id

    if (!messageSubdocument) {
      // This should ideally not happen if parentMessageDoc was found, but as a safeguard
      console.error(`Internal Error: Subdocument with ID ${messageId} not found within the parent document.`);
      return res.status(404).json({ error: 'Message subdocument not found within chat history.' });
    }

    // Update the subdocument's fields
    messageSubdocument.content = content;
    messageSubdocument.isEdited = true;
    messageSubdocument.editedAt = new Date(); // Add editedAt to your messageSubSchema if not present

    console.log('Subdocument updated in memory. Saving parent Message document...');
    await parentMessageDoc.save(); // Save the parent document to persist subdocument changes
    console.log('Parent Message document saved.');

    // 3. Manually populate the sender and replyTo for the updated subdocument
    // We'll re-fetch the parent document with populated fields for the specific message
    console.log('Re-fetching and populating the edited message...');
    const populatedParentMessageDoc = await Message.findOne({ chat: parentMessageDoc.chat })
      .populate({
        path: 'messages.sender', // Populate sender for all messages in the array
        select: 'username profilePic'
      });

    let populatedEditedMessage = populatedParentMessageDoc.messages.find(msg => msg._id.equals(messageId));

    if (!populatedEditedMessage) {
      console.error('CRITICAL ERROR: Edited message subdocument not found after re-fetch and populate.');
      throw new Error('Failed to locate the edited message after processing.');
    }

    // Handle replyTo population manually for the edited message
    if (populatedEditedMessage.replyTo) {
      const repliedToMessageSubdocument = populatedParentMessageDoc.messages.find(
        msg => msg._id.equals(populatedEditedMessage.replyTo)
      );

      if (repliedToMessageSubdocument) {
        // Reuse the TempMessageModel logic from getMessages/sendMessage
        let TempMessageModel;
        try {
          TempMessageModel = mongoose.model('TempMessageForPopulate');
        } catch (error) {
          TempMessageModel = mongoose.model('TempMessageForPopulate', new mongoose.Schema({
            sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel' },
            senderModel: String,
            content: String
          }));
        }
        const tempRepliedToDoc = new TempMessageModel(repliedToMessageSubdocument.toObject());
        await tempRepliedToDoc.populate({
          path: 'sender',
          select: 'username profilePic'
        });
        populatedEditedMessage.replyTo = tempRepliedToDoc;
      } else {
        console.warn(`Replied-to message with ID ${populatedEditedMessage.replyTo} not found in chat ${populatedParentMessageDoc.chat}.`);
        populatedEditedMessage.replyTo = null;
      }
    }
    console.log('Edited message populated successfully.');

    // 4. Update chat's last message if this was the last message
    console.log('Checking if edited message was the last message in chat...');
    const chat = await Chat.findOne({
      _id: parentMessageDoc.chat,
      'lastMessage.messageId': messageId // Check if this message was the last one
    });

    if (chat) {
      chat.lastMessage.content = content.length > 50
        ? content.substring(0, 50) + '...'
        : content;
      await chat.save();
      console.log('Chat last message updated.');
    } else {
      console.log('Edited message was not the last message in chat, or chat not found.');
    }

    // 5. Notify participants via socket.io
    console.log('Notifying participants via Socket.IO...');
    const io = getIO();
    const chatParticipants = await Chat.findById(parentMessageDoc.chat).select('participants');
    if (io && chatParticipants) {
        chatParticipants.participants.forEach(participant => {
            io.to(participant.participant.toString()).emit('messageEdited', populatedEditedMessage.toObject({ getters: true, virtuals: false }));
        });
        console.log('Socket.IO notification complete.');
    } else {
      console.warn('Socket.IO instance (io) or chatParticipants not available. Message edit will not be emitted via sockets.');
    }


    res.json(populatedEditedMessage.toObject({ getters: true, virtuals: false }));
  } catch (error) {
    console.error('--- Error editing message ---');
    console.error('Error details:', error);
    if (error.name === 'CastError') {
      console.error('Mongoose Cast Error (e.g., invalid ID format):', error.message);
      res.status(400).json({ error: 'Invalid ID format', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to edit message', details: error.message });
    }
  }
};


// React to a message
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params; // messageId is the _id of the subdocument
    const { emoji } = req.body;
    const userId = req.user.userId;
    const userModel = req.user.userType === 'User' ? 'User' : 'Business';

    console.log('--- reactToMessage Request Details ---');
    console.log('messageId:', messageId);
    console.log('emoji:', emoji);
    console.log('userId (from req.user):', userId);
    console.log('userModel (from req.user):', userModel);
    console.log('---------------------------------');

    if (!emoji) {
      console.error('Validation Error: Emoji is required.');
      return res.status(400).json({ error: 'Emoji is required' });
    }

    // 1. Find the parent Message document that contains the subdocument
    // We need to find the document where one of its 'messages' subdocuments matches the messageId
    console.log('Attempting to find parent Message document containing the messageId...');
    const parentMessageDoc = await Message.findOne({
      'messages._id': messageId,
      // Optional: Add a check for 'deletedFor.user' at the subdocument level if needed for reactions
      // 'messages.deletedFor.user': { $ne: userId }
    });

    if (!parentMessageDoc) {
      console.error(`Existence Error: Message with ID ${messageId} not found in any chat history.`);
      return res.status(404).json({ error: 'Message not found or deleted' });
    }
    console.log('Parent Message document found:', parentMessageDoc._id);

    // 2. Locate the specific message subdocument
    const messageSubdocument = parentMessageDoc.messages.id(messageId); // Mongoose helper to find subdocument by _id

    if (!messageSubdocument) {
      console.error(`Internal Error: Subdocument with ID ${messageId} not found within the parent document's messages array.`);
      return res.status(404).json({ error: 'Message subdocument not found within chat history.' });
    }

    // Check if user is a participant in the chat (using the chat ID from the parent document)
    console.log('Checking user participation in the chat...');
    const chat = await Chat.findOne({
      _id: parentMessageDoc.chat, // Use the chat ID from the found parent Message document
      'participants.participant': userId,
      'deletedFor.user': { $ne: userId }
    });

    if (!chat) {
      console.error(`Authorization Error: User ${userId} is not a participant in chat ${parentMessageDoc.chat} or chat is deleted.`);
      return res.status(403).json({ error: 'You are not a participant in this chat or chat is deleted' });
    }
    console.log('User is a participant in chat:', chat._id);


    // 3. Update reactions on the subdocument
    console.log('Updating reactions on the message subdocument...');
    const existingReactionIndex = messageSubdocument.reactions.findIndex(
      r => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex !== -1) {
      // If user already reacted with this emoji, remove it (toggle off)
      messageSubdocument.reactions.splice(existingReactionIndex, 1);
      console.log('Removed existing reaction.');
    } else {
      // Remove any other existing reaction from this user first (only one reaction per user per message)
      messageSubdocument.reactions = messageSubdocument.reactions.filter(
        r => r.user.toString() !== userId.toString()
      );

      // Add new reaction
      messageSubdocument.reactions.push({
        user: userId,
        userModel,
        emoji,
        reactedAt: new Date() // Ensure your messageSubSchema has 'reactedAt' in the reactions sub-schema
      });
      console.log('Added new reaction.');
    }

    // 4. Save the updated parent Message document to persist changes to the subdocument
    console.log('Saving parent Message document to persist reaction changes...');
    await parentMessageDoc.save();
    console.log('Parent Message document saved.');

    // 5. Notify participants via socket.io
    console.log('Notifying participants via Socket.IO...');
    const io = getIO();
    if (io) {
      chat.participants.forEach(participant => {
        io.to(participant.participant.toString()).emit('messageReaction', {
          messageId: messageSubdocument._id, // Use the subdocument's ID
          reactions: messageSubdocument.reactions.toObject() // Convert to plain object for emission
        });
        console.log(`Emitted 'messageReaction' to participant: ${participant.participant.toString()}`);
      });
      console.log('Socket.IO notification complete.');
    } else {
      console.warn('Socket.IO instance (io) not available. Message reaction will not be emitted via sockets.');
    }

    res.json(messageSubdocument.reactions.toObject()); // Return the updated reactions array
  } catch (error) {
    console.error('--- Error reacting to message ---');
    console.error('Error details:', error);
    if (error.name === 'CastError') {
      console.error('Mongoose Cast Error (e.g., invalid ID format):', error.message);
      res.status(400).json({ error: 'Invalid ID format', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to react to message', details: error.message });
    }
  }
};
