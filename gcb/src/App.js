import Components from './Components/Components';
import * as Env from "./Environments.js";
import Parse from "parse";

Parse.initialize(Env.APPLICATION_ID, Env.JAVASCRIPT_KEY);
Parse.serverURL = Env.SERVER_URL;

export default function App() {
  return <Components />
}

