import React, { FunctionComponent } from "react";
import { AppProps } from "next/app";
import Head from "next/head";

const MyApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Movies 365</title>
      </Head>

      <main>
        <Component {...pageProps} />
      </main>

      <style jsx>{`
        main {
          display: grid;
          gap: 1rem;
        }
      `}</style>

      <style jsx global>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");

          html,
          body,
          #__next {
            font-family: "Montserrat", sans-serif;
            font-size: 16px;
            color: #333;
            padding: 0;
            margin: 0;
          }

          p,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </>
  );
};

export default MyApp;
