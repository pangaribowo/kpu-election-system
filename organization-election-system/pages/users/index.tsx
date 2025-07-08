import { GetStaticProps } from "next";
import Link from "next/link";
import { useVoting } from "../../components/VotingContext";
import { useRouter } from "next/router";
import React from "react";

import { User } from "../../interfaces";
import { sampleUserData } from "../../utils/sample-data";
import Layout from "../../components/Layout";
import List from "../../components/List";

type Props = {
  items: User[];
};

const WithStaticProps = ({ items }: Props) => {
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
    <Layout title="Users List | Next.js + TypeScript Example">
      <h1>Users List</h1>
      <p>
        Example fetching data from inside <code>getStaticProps()</code>.
      </p>
      <p>You are currently on: /users</p>
      <List items={items} />
      <p>
        <Link href="/">Go home</Link>
      </p>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  // Example for including static props in a Next.js function component page.
  // Don't forget to include the respective types for any props passed into
  // the component.
  const items: User[] = sampleUserData;
  return { props: { items } };
};

export default WithStaticProps;
