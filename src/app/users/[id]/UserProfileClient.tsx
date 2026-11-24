"use client";

import { useState } from "react";
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
  const [reviewsCount, setReviewsCount] = useState<number | null>(null);

  return (
    <ProfileView
      userId={userId}
      initialProfile={initialProfile}
      reviewsCount={reviewsCount}
    >
      <UserReviewHistory
        userId={userId}
        onTotalLoaded={setReviewsCount}
        renderMovie={(movieId) => <MovieTitleLink movieId={movieId} />}
      />
    </ProfileView>
  );
}
