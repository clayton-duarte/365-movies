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
import {
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineDelete,
  AiOutlineEye,
} from "react-icons/ai";

interface Movie {
  name: string;
  id: string;
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

  const handleClickSelect = (index: number) => (e: MouseEvent): void => {
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

  const handleClickMark = (index: number) => async (
    e: MouseEvent
  ): Promise<void> => {
    e.preventDefault();
    await Axios.post("/api/updateMovie", {
      ...movies[index],
      sawAt: new Date().toISOString(),
    });
    router.reload();
  };

  const handleClickUnMark = (index: number) => async (
    e: MouseEvent
  ): Promise<void> => {
    e.preventDefault();
    await Axios.post("/api/updateMovie", {
      ...movies[index],
      sawAt: null,
    });
    router.reload();
  };

  const handleClickDelete = (index: number) => async (
    e: MouseEvent
  ): Promise<void> => {
    e.preventDefault();
    await Axios.post("/api/deleteMovie", {
      ...movies[index],
      sawAt: new Date().toISOString(),
    });
    router.reload();
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
        <input
          onChange={handleChange}
          placeholder="Movie Name"
          className="card"
          name="name"
        />
        <button className="card" disabled={!canSubmit}>
          <AiOutlineCheckCircle />
        </button>
      </form>
      <ul>
        {movies.sort(sortByDate).map(({ id, name, sawAt }, index) => {
          const isSelected = index === selected;

          return (
            <li key={id}>
              <section className="cutter">
                <div
                  className={`card row ${isSelected && "active"}`}
                  onClick={handleClickSelect(index)}
                >
                  <span className={sawAt ? "strike" : ""}>{name}</span>
                  <span>
                    {sawAt && DateTime.fromISO(sawAt).toFormat("dd LLL yyyy")}
                  </span>
                </div>
                <div className={`row even ${isSelected && "active"}`}>
                  <button
                    className="card"
                    onClick={
                      sawAt ? handleClickUnMark(index) : handleClickMark(index)
                    }
                  >
                    {sawAt ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                  <button className="card" onClick={handleClickDelete(index)}>
                    <AiOutlineDelete />
                  </button>
                </div>
              </section>
            </li>
          );
        })}
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
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border: none;
        }

        button {
          text-transform: uppercase;
          justify-content: center;
          align-items: center;
          background: white;
          font-weight: bold;
          font-size: 1.5rem;
          display: grid;
        }

        button.card {
          padding: 0.25rem;
        }

        header {
          box-shadow: 0 0 0.5rem #0003;
          background: white;
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
          padding: 0;
          margin: 0;
        }

        li {
          padding: 0;
        }

        section.cutter {
          grid-template-columns: 1fr 1fr;
          padding: 0.5rem 1rem;
          align-items: center;
          overflow: hidden;
          display: grid;
          width: 100vw;
          gap: 1rem;
        }

        .card {
          box-shadow: 0 0 0.5rem #0003;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
        }

        input.card {
          box-shadow: inset 0 0 0.5rem #0003;
        }

        div.row {
          grid-template-columns: auto auto;
          justify-content: space-between;
          width: calc(100vw - 2rem);
          transition: 0.3s ease;
          display: grid;
          gap: 1rem;
        }

        div.row.even {
          margin-left: 1rem;
        }

        div.row.active.even {
          grid-template-columns: 1fr 1fr;
          margin-left: -1rem;
        }

        div.row.active {
          margin-left: calc(-100vw + -1rem);
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
