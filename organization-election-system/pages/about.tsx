import Link from "next/link";
import Layout from "../components/Layout";
import { useVoting } from "../components/VotingContext";
import { useRouter } from "next/router";
import React from "react";

const AboutPage = () => {
  const { currentUser, isAuthChecked } = useVoting();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isAuthChecked, router]);

  if (!isAuthChecked) return null;
  if (!currentUser) return null;

  return (
    <Layout title="About | Next.js + TypeScript Example">
      <h1>About</h1>
      <p>This is the about page</p>
      <p>
        <Link href="/">Go home</Link>
      </p>
    </Layout>
  );
};

export default AboutPage;
