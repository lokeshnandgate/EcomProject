import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store/store';
import { updateUserProfileDetails, updateBusinessProfileDetails } from '../../../redux/profile/action';
import { RootState } from '../../../redux/store/store';

const EditProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    locationUrl: '',
    address: '',
    about: '',
    businessType: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        contactNumber: profile.contactNumber || '',
        locationUrl: profile.locationUrl || '',
        address: profile.address || '',
        about: profile.about || '',
        businessType: 'businessType' in profile ? profile.businessType || '' : '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (profile && 'businessType' in profile) {
      dispatch(updateBusinessProfileDetails(formData));
    } else {
      dispatch(updateUserProfileDetails(formData));
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Location URL</label>
          <input type="url" name="locationUrl" value={formData.locationUrl} onChange={handleChange} />
        </div>
        <div>
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div>
          <label>About</label>
          <textarea name="about" value={formData.about} onChange={handleChange}></textarea>
        </div>
        {profile && 'businessType' in profile && (
          <div>
            <label>Business Type</label>
            <input
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
            />
          </div>
        )}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfilePage;
