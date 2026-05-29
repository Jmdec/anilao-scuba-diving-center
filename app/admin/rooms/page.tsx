"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { Plus, Edit, Trash2, Search, Upload, X, Loader2 } from "lucide-react";

interface Room {
  id: number;
  name: string;
  type: string;
  price_per_night: number;
  max_guests: number;
  description: string;
  amenities: string[];
  image_url?: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http")) return imagePath;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
  return `${backendUrl}${imagePath}`;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price_per_night: "",
    max_guests: "",
    description: "",
    amenities: "",
    image_url: "",
    is_available: true,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        const data = await response.json();
        if (data.success) setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const buildFormData = () => {
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("type", formData.type);
    submitData.append("description", formData.description);
    submitData.append("price_per_night", formData.price_per_night);
    submitData.append("max_guests", formData.max_guests);
    submitData.append("is_available", formData.is_available.toString());

    const amenitiesArray = formData.amenities
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);
    amenitiesArray.forEach((amenity, index) =>
      submitData.append(`amenities[${index}]`, amenity),
    );

    if (selectedFile) submitData.append("image", selectedFile);
    return submitData;
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        body: buildFormData(),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: "Room created successfully" });
          setIsCreateDialogOpen(false);
          resetForm();
          fetchRooms();
        }
      } else {
        throw new Error("Failed to create room");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setUploading(true);
    try {
      const response = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: "PUT",
        body: buildFormData(),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: "Room updated successfully" });
          setIsEditDialogOpen(false);
          setEditingRoom(null);
          resetForm();
          fetchRooms();
        }
      } else {
        throw new Error("Failed to update room");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rooms/${roomToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: "Room deleted successfully" });
          setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
        }
      } else {
        throw new Error("Failed to delete room");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      price_per_night: "",
      max_guests: "",
      description: "",
      amenities: "",
      image_url: "",
      is_available: true,
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      price_per_night: room.price_per_night.toString(),
      max_guests: room.max_guests.toString(),
      description: room.description,
      amenities: Array.isArray(room.amenities)
        ? room.amenities.join(", ")
        : room.amenities || "",
      image_url: room.image_url || "",
      is_available: room.is_available,
    });
    setSelectedFile(null);
    setPreviewUrl(getImageUrl(room.image_url));
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData({ ...formData, image_url: "" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const roomForm = (
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string,
  ) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Room Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Deluxe Ocean View"
            required
          />
        </div>
        <div>
          <Label>Room Type</Label>
          <Input
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="e.g., Deluxe"
            required
          />
        </div>
        <div>
          <Label>Price per Night ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price_per_night}
            onChange={(e) =>
              setFormData({ ...formData, price_per_night: e.target.value })
            }
            placeholder="150.00"
            required
          />
        </div>
        <div>
          <Label>Max Guests</Label>
          <Input
            type="number"
            value={formData.max_guests}
            onChange={(e) =>
              setFormData({ ...formData, max_guests: e.target.value })
            }
            placeholder="2"
            required
          />
        </div>
      </div>
      <div>
        <Label>Availability</Label>
        <Select
          value={formData.is_available.toString()}
          onValueChange={(value) =>
            setFormData({ ...formData, is_available: value === "true" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Available</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Room description..."
          rows={3}
        />
      </div>
      <div>
        <Label>Amenities (comma-separated)</Label>
        <Textarea
          value={formData.amenities}
          onChange={(e) =>
            setFormData({ ...formData, amenities: e.target.value })
          }
          placeholder="Air conditioning, WiFi, Ocean view, Mini bar"
          rows={2}
        />
      </div>
      <div>
        <Label>Room Image</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
            />
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {previewUrl && (
            <div className="relative w-full h-32 border rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-700"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              {submitLabel === "Create Room" ? "Creating..." : "Updating..."}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-900">Room Management</h2>
          <p className="text-cyan-600">
            Manage accommodation rooms and availability
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>
                Add a new room to the accommodation system
              </DialogDescription>
            </DialogHeader>
            {roomForm(handleCreateRoom, "Create Room")}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>
                {filteredRooms.length} room
                {filteredRooms.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Max Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading rooms...
                    </TableCell>
                  </TableRow>
                ) : filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>${room.price_per_night}</TableCell>
                      <TableCell>{room.max_guests} guests</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            room.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {room.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(room)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(room)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>Update room information</DialogDescription>
          </DialogHeader>
          {roomForm(handleEditRoom, "Update Room")}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogHeader className="items-center text-center">
              <DialogTitle className="text-red-600">Delete Room</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">
                  "{roomToDelete?.name}"
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 w-full sm:justify-center">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setRoomToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRoom}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
