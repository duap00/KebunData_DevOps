import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Admin() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get the currently logged-in user (whoever they are)
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image!");
    setUploading(true);

    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`; // Organize by User ID
      const filePath = `user-uploads/${fileName}`;

      // 1. Upload to Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from('farm-updates')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('farm-updates').getPublicUrl(filePath);

      // 2. Save to Database - Include user_id so we know who posted it
      const { error: dbError } = await supabase
        .from('articles')
        .insert([{ 
          title, 
          content, 
          image_url: urlData.publicUrl,
          user_id: user.id, // Links the post to the specific registered user
          author_name: user.email 
        }]);

      if (dbError) throw dbError;

      alert("Article posted successfully!");
      setTitle(''); setContent('');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // IF NOT LOGGED IN: Show a message
  if (!user) {
    return <div style={{padding: '20px'}}>Please login to post your farm updates.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Welcome, {user.email}</h2>
      <p>Post an update for your farm below:</p>
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        <textarea placeholder="Write your update..." value={content} onChange={(e) => setContent(e.target.value)} required style={{...inputStyle, height: '100px'}} />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
        <button type="submit" disabled={uploading} style={btnStyle}>
          {uploading ? 'Uploading...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btnStyle = { padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };

export default Admin;