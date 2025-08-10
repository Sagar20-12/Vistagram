import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  Edit3, 
  Settings, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar,
  Globe,
  Lock,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Plus,
  Grid,
  List,
  Bookmark
} from 'lucide-react';
import { seedPosts } from '@/data/seedPosts';
import VistaPostCardDraggable from '@/components/VistaPostCardDraggable';

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || 'Vistagram User',
    bio: 'Passionate traveler and photographer. Capturing moments around the world 🌍',
    location: 'Worldwide',
    website: 'https://vistagram.com',
    isPrivate: false,
    notifications: true,
    theme: 'light'
  });

  // Mock user stats
  const userStats = {
    posts: 24,
    followers: 1247,
    following: 892,
    likes: 15420
  };

  // Filter posts for this user (mock data)
  const userPosts = seedPosts.slice(0, 6).map(post => ({
    ...post,
    author: user?.displayName || 'Vistagram User',
    location: profileData.location
  }));

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log('Profile updated:', profileData);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Profile Not Available</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view your profile
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Profile</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback className="text-2xl">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.displayName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    <Globe className="h-3 w-3 mr-1" />
                    Public Profile
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats.followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userStats.likes}</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button className="w-full" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Bio</Label>
                  <p className="text-sm text-muted-foreground mt-1">{profileData.bio}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profileData.location}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <a 
                    href={profileData.website} 
                    className="text-sm text-purple-600 hover:underline mt-1 block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profileData.website}
                  </a>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="liked">Liked</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Your Posts</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userPosts.map((post) => (
                      <VistaPostCardDraggable key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <VistaPostCardDraggable key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="liked" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Liked Posts Yet</h3>
                      <p className="text-muted-foreground">
                        Posts you like will appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Bookmark className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Saved Posts</h3>
                      <p className="text-muted-foreground">
                        Save posts to view them later
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Settings */}
                    <div>
                      <h4 className="font-semibold mb-4">Profile Information</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={profileData.displayName}
                            onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            disabled={!isEditing}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={profileData.website}
                            onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button onClick={handleSaveProfile}>Save Changes</Button>
                              <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button onClick={() => setIsEditing(true)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Profile
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Privacy Settings */}
                    <div>
                      <h4 className="font-semibold mb-4">Privacy & Security</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">Private Account</Label>
                            <p className="text-sm text-muted-foreground">
                              Only approved followers can see your posts
                            </p>
                          </div>
                          <Switch
                            checked={profileData.isPrivate}
                            onCheckedChange={(checked) => setProfileData({...profileData, isPrivate: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications for likes and comments
                            </p>
                          </div>
                          <Switch
                            checked={profileData.notifications}
                            onCheckedChange={(checked) => setProfileData({...profileData, notifications: checked})}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Account Actions */}
                    <div>
                      <h4 className="font-semibold mb-4">Account Actions</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Download My Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
