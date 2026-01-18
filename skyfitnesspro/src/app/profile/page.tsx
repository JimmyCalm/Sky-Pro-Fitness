import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      {/* весь контент профиля */}
      <h1>Мой профиль</h1>
      {/* ... */}
    </ProtectedRoute>
  );
}
// позже реализую функционал профиля