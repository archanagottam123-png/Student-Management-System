import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Profile() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your admin account settings.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="w-16 h-16 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              AD
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">Admin User</h2>
            <p className="text-sm text-muted-foreground">admin@akademia.edu</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value="admin" disabled data-testid="input-profile-username" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value="admin@akademia.edu" disabled data-testid="input-profile-email" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value="Administrator" disabled data-testid="input-profile-role" />
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={handleLogout}
        data-testid="button-profile-logout"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
