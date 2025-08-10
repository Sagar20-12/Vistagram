"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, MapPin, User, Image } from "lucide-react";
import { seedPosts } from "@/data/seedPosts";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock search results - in a real app, this would come from an API
  const searchResults = seedPosts.filter(post => 
    post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (value: string) => {
    // Handle search result selection
    console.log("Selected:", value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Vistagram
          </DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search posts, locations, or users..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {searchQuery && (
              <CommandGroup heading="Search Results">
                {searchResults.slice(0, 5).map((post) => (
                  <CommandItem
                    key={post.id}
                    value={post.id}
                    onSelect={handleSelect}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{post.author}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{post.caption}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{post.location}</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!searchQuery && (
              <CommandGroup heading="Popular Searches">
                <CommandItem value="dubai" onSelect={handleSelect}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Dubai
                </CommandItem>
                <CommandItem value="paris" onSelect={handleSelect}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Paris
                </CommandItem>
                <CommandItem value="tokyo" onSelect={handleSelect}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Tokyo
                </CommandItem>
                <CommandItem value="new-york" onSelect={handleSelect}>
                  <MapPin className="mr-2 h-4 w-4" />
                  New York
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
