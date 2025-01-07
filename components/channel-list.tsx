import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  members: Array<{
    userId: string;
    isAdmin: boolean;
    user: {
      name: string;
    };
  }>;
}

export const ChannelList = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      const response = await axios.get("/api/channels");
      setChannels(response.data);
    };
    fetchChannels();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Channels</h2>
        <Button onClick={() => setIsModalOpen(true)}>Create Channel</Button>
      </div>
      <ul className="space-y-2">
        {channels.map((channel) => (
          <li
            key={channel.id}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
          >
            <span>{channel.isPrivate ? "🔒" : "#"}</span>
            <span>{channel.name}</span>
          </li>
        ))}
      </ul>
      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}; 