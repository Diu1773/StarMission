import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      {children}
    </div>
  );
}
