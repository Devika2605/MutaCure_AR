// pages/protein.jsx  (or app/protein/page.jsx for App Router)
// Person 2's route — /protein
import Head from "next/head";
import ProteinViewer from "../components/protein/ProteinViewer";

export default function ProteinPage() {
  return (
    <>
      <Head>
        <title>Protein Explorer — MutaCure AR</title>
        <meta name="description" content="3D protein structure prediction and AR visualization" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ProteinViewer />
    </>
  );
}