import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        // Save additional profile info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          middleName: middleName || null,
          createdAt: new Date().toISOString()
        });
      } catch (firestoreErr) {
        console.error("Firestore error:", firestoreErr);
        // We continue even if Firestore fails, as the auth user is already created
        // But we might want to alert them to set up Firestore.
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-container">
      <Paper elevation={3} className="auth-paper glass-panel">
        <Typography variant="h4" component="h1" gutterBottom className="auth-title">
          Create Account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSignup} className="auth-form">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              variant="outlined"
            />
            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              variant="outlined"
            />
          </Box>
          <TextField
            label="Middle Name (Optional)"
            fullWidth
            margin="normal"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="outlined"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login" className="auth-link">Log In</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
