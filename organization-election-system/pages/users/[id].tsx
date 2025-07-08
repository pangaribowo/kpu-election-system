import { GetStaticProps, GetStaticPaths } from "next";
import { useVoting } from "../../components/VotingContext";
import { useRouter } from "next/router";
import React from "react";

import { User } from "../../interfaces";
import { sampleUserData } from "../../utils/sample-data";
import Layout from "../../components/Layout";
import ListDetail from "../../components/ListDetail";

type Props = {
  item?: User;
  errors?: string;
};

const StaticPropsDetail = ({ item, errors }: Props) => {
  const { currentUser, isAuthChecked } = useVoting();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isAuthChecked, router]);

  if (!isAuthChecked) return null;
  if (!currentUser) return null;

  if (errors) {
    return (
      <Layout title="Error | Next.js + TypeScript Example">
        <p>
          <span style={{ color: "red" }}>Error:</span> {errors}
        </p>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${item ? item.name : "User Detail"} | Next.js + TypeScript Example`}
    >
      {item && <ListDetail item={item} />}
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Get the paths we want to pre-render based on users
  const paths = sampleUserData.map((user) => ({
    params: { id: user.id.toString() },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const id = params?.id;
    const item = sampleUserData.find((data) => data.id === Number(id));
    // By returning { props: item }, the StaticPropsDetail component
    // will receive `item` as a prop at build time
    return { props: { item } };
  } catch (err: any) {
    return { props: { errors: err.message } };
  }
};

export default StaticPropsDetail;
