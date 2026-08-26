import { redirect } from "react-router"

export async function loader() {
  throw redirect("/auth/signin")
}
