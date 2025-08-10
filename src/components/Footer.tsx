import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Camera, Heart, MapPin, Globe } from "lucide-react";
import CameraUploadDialog from "./CameraUploadDialog";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Vistagram</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Start your Vistagram journey today!
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of travelers sharing their POI moments. Capture memories, 
            discover new places, and connect with fellow adventurers around the world.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <CameraUploadDialog triggerLabel="Start Capturing" />
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                document.getElementById('timeline')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              Explore Timeline
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-purple-600 transition-colors">About Vistagram</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Guidelines</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Feedback</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Tutorials</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">API</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Developers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex items-center mb-4 md:mb-0">
            <Globe className="h-4 w-4 mr-2" />
            <span>© 2025 Vistagram. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>for travelers worldwide by</span>
            <a 
              href="https://github.com/Sagar20-12" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
            >
              Sagar Singh Raghav
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
