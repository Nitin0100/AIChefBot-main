import { Container } from "react-bootstrap";
import MainNav from "./MainNav";
import { useSession } from 'next-auth/react';
export default function Layout(props) {
   const { data: session, status } = useSession();

   if (status === "loading") {
      return null;
   }

   return (
      <>
         <MainNav/>
         <br/>
         <br/>
         <Container>
            {props.children}
         </Container>
         <br/>
      </>
   );
}