import React, { FunctionComponent } from "react";
import { AppProps } from "next/app";

const MyApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <main>
        <Component {...pageProps} />
      </main>

      <style jsx>{`
        main {
          padding: 1rem;
          display: grid;
          gap: 1rem;
        }
      `}</style>

      <style jsx global>
        {`
          html,
          body,
          #__next {
            font-family: BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
              Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
            font-size: 16px;
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
