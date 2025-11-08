import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Code2 } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    if (isLogin) {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } else {
      if (!name || !email || !password) {
        setError('All fields are required');
        return;
      }


      const success = await signup(name, email, password);
      if (!success) {
        setError('Email already exists');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-liner-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Sign in to continue your learning journey' : 'Start your learning journey today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input-background"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input-background"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
