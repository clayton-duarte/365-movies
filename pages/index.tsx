import React, {
  FunctionComponent,
  MouseEvent,
  FormEvent,
  useState,
  ChangeEvent,
} from "react";
import { GetServerSideProps } from "next";
import { Client, query } from "faunadb";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import Axios from "axios";

interface Movie {
  id: string;
  name: string;
  sawAt?: string;
}

interface HomePageProps {
  movies: Movie[];
}

const HomePage: FunctionComponent<HomePageProps> = ({ movies }) => {
  const [formData, setFormData] = useState<Partial<Movie>>({});
  const [selected, setSelected] = useState<number>();
  const router = useRouter();

  const canSubmit = Boolean(formData.name);

  const handleClick = (index: number) => (e: MouseEvent): void => {
    e.preventDefault();
    setSelected(index);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      await Axios.post("/api/createMovie", formData);
      router.reload();
    }
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
        <h1>365 Movies</h1>
      </header>

      <form onSubmit={handleSubmit}>
        <input name="name" onChange={handleChange} placeholder="Movie Name" />
        <button disabled={!canSubmit}>ok</button>
      </form>
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
        form {
          grid-template-columns: 1fr auto;
          justify-content: space-between;
          display: grid;
          padding: 1rem;
          gap: 1rem;
        }

        input {
          box-shadow: 0 0 0.5rem #0003;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border: none;
        }

        button {
          box-shadow: 0 0 0.5rem #0003;
          text-transform: uppercase;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          font-weight: bold;
          border: none;
        }

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
          padding: 0 1rem;
          margin: 0;
          gap: 1rem;
        }

        li {
          grid-template-columns: auto auto;
          justify-content: space-between;
          box-shadow: 0 0 0.5rem #0003;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          display: grid;
          gap: 1rem;
        }

        span {
          text-transform: capitalize;
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
