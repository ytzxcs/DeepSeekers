
import SignupForm from '@/components/SignupForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SignupPage = () => {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/dashboard');
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Product <span className="text-brand-blue">Management</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your products and their price history
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create an Account</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
