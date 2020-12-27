import React, { FunctionComponent, MouseEvent, useState } from "react";
import { GetServerSideProps } from "next";
import { Client, query } from "faunadb";
import { DateTime } from "luxon";

interface Movie {
  id: string;
  name: string;
  sawAt?: string;
}
interface HomePageProps {
  movies: Movie[];
}

const HomePage: FunctionComponent<HomePageProps> = ({ movies }) => {
  const [selected, setSelected] = useState<number>();

  const handleClick = (index: number) => (e: MouseEvent): void => {
    e.preventDefault();
    setSelected(index);
  };

  const sortByDate = (
    { sawAt: prevSawAt }: Movie,
    { sawAt: currSawAt }: Movie
  ): number => {
    const toNum = (isoDate = ""): number => Number(isoDate.replace(/\D/g, ""));
    return toNum(prevSawAt) - toNum(currSawAt);
  };

  return (
    <>
      <header>
        <h1>Movies 365</h1>
      </header>

      <ul>
        {movies.sort(sortByDate).map(({ id, name, sawAt }, index) => (
          <li key={id} onClick={handleClick(index)}>
            <span className={sawAt ? "strike" : ""}>
              {name}
              {index === selected && "*"}
            </span>
            <span>
              {sawAt && DateTime.fromISO(sawAt).toFormat("dd LLL yyyy")}
            </span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        header {
          box-shadow: 0 0 0.5rem #0003;
          position: sticky;
          padding: 1rem;
          top: 0;
        }

        h1 {
          font-size: 2rem;
        }

        ul {
          list-style: none;
          display: grid;
          padding: 1rem;
          margin: 0;
          gap: 1rem;
        }

        li {
          grid-template-columns: auto auto;
          box-shadow: 0 0 0.5rem #0003;
          justify-content: space-between;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          display: grid;
          gap: 1rem;
        }

        .strike {
          text-decoration: line-through;
        }
      `}</style>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const client = new Client({ secret: process.env.FAUNADB_SECRET });
  const q = query;

  const response = await client.query<{ data: { data: Movie; ref: any }[] }>(
    q.Map(
      q.Paginate(q.Documents(q.Collection("movies"))),
      q.Lambda((movie) => q.Get(movie))
    )
  );

  return {
    props: {
      movies: response.data.map(({ ref, data }) => ({
        id: ref?.value?.id,
        ...data,
      })),
    },
  };
};

export default HomePage;
