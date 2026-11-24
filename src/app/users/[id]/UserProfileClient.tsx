"use client";

import { MovieTitleLink } from "@/features/movies";
import { ProfileView, type PublicProfile } from "@/features/profile";
import { UserReviewHistory } from "@/features/reviews";

export type UserProfileClientProps = {
  userId: string;
  initialProfile?: PublicProfile | null;
};

export function UserProfileClient({
  userId,
  initialProfile,
}: UserProfileClientProps) {
  return (
    <ProfileView userId={userId} initialProfile={initialProfile}>
      <UserReviewHistory
        userId={userId}
        renderMovie={(movieId) => <MovieTitleLink movieId={movieId} />}
      />
    </ProfileView>
  );
}
