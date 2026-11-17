import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <section>
      <h2>Ласкаво просимо до TourHub</h2>
      <p>TourHub — каталог турів від різних туроператорів.</p>
      <p>
        <Link to="/catalog">Переглянути каталог турів</Link> можна без входу.{" "}
        {user ? (
          <>Додавати й редагувати тури можна в розділі <Link to="/manage/tours">Керування турами</Link>.</>
        ) : (
          <>Щоб додавати тури, <Link to="/login">увійдіть</Link> або <Link to="/register">зареєструйтеся</Link>.</>
        )}
      </p>
    </section>
  );
}
