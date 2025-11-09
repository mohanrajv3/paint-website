import UserPresence, { User } from '../UserPresence';

const mockUsers: User[] = [
  { id: '1', name: 'Alice Chen', color: '#3B82F6', isDrawing: true },
  { id: '2', name: 'Bob Smith', color: '#8B5CF6', isDrawing: false },
  { id: '3', name: 'Charlie Davis', color: '#10B981', isDrawing: true },
  { id: '4', name: 'Diana Lee', color: '#F59E0B', isDrawing: false },
];

export default function UserPresenceExample() {
  return (
    <div className="w-full min-h-screen bg-background p-4 flex items-start justify-center">
      <UserPresence users={mockUsers} currentUserId="1" />
    </div>
  );
}
