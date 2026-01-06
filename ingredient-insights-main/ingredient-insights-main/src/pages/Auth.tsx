import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Leaf, Heart, AlertCircle, X, Plus, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const commonHealthIssues = [
  'Diabetes', 'High Blood Pressure', 'High Cholesterol', 'Heart Disease',
  'Thyroid Disorder', 'IBS/GERD', 'Kidney Disease', 'Celiac Disease',
  'Lactose Intolerance', 'PCOS', 'Gout', 'Anemia'
];

const commonAllergies = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'
];

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [healthIssues, setHealthIssues] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0].message);
        return false;
      }
    }
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        toast.error(e.errors[0].message);
        return false;
      }
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          health_issues: healthIssues,
          allergies: allergies,
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please log in instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      // Update profile with health info after signup
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          health_issues: healthIssues,
          allergies: allergies,
        }).eq('user_id', user.id);
      }
      toast.success('Account created successfully!');
    }
    setIsLoading(false);
  };

  const toggleHealthIssue = (issue: string) => {
    setHealthIssues(prev => 
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const addCustomHealthIssue = () => {
    if (customInput.trim() && !healthIssues.includes(customInput.trim())) {
      setHealthIssues(prev => [...prev, customInput.trim()]);
      setCustomInput('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">NutriView</h1>
          <p className="text-muted-foreground mt-2">Your personal ingredient analyzer</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 space-y-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Health Issues Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-danger" />
                      <Label>Health Issues (optional)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select any health conditions for personalized ingredient alerts
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {commonHealthIssues.map((issue) => (
                        <Badge
                          key={issue}
                          variant={healthIssues.includes(issue) ? 'default' : 'outline'}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleHealthIssue(issue)}
                        >
                          {issue}
                          {healthIssues.includes(issue) && (
                            <X className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom health issue..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHealthIssue())}
                        className="text-sm"
                      />
                      <Button type="button" size="icon" variant="outline" onClick={addCustomHealthIssue}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Allergies Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <Label>Allergies (optional)</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {commonAllergies.map((allergy) => (
                        <Badge
                          key={allergy}
                          variant={allergies.includes(allergy) ? 'destructive' : 'outline'}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleAllergy(allergy)}
                        >
                          {allergy}
                          {allergies.includes(allergy) && (
                            <X className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
