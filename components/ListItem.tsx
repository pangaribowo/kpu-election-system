import React from "react";
import Link from "next/link";

import { User } from "../interfaces";

type Props = {
  data: User;
};

const ListItem = ({ data }: Props) => (
  <Link href="/users/[id]" as={`/users/${data.id}`} className="...">
    {data.id}:{data.name}
  </Link>
);

export default ListItem;
