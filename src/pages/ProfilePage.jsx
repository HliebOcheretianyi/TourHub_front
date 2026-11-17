import { useAuth } from "../auth/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <section className="narrow">
      <h2>Профіль</h2>
      <table>
        <tbody>
          <tr><th>Ім'я користувача</th><td>{user.username}</td></tr>
          <tr><th>Ім'я та прізвище</th><td>{fullName || <span className="muted">не вказано</span>}</td></tr>
          <tr><th>Email</th><td>{user.email}</td></tr>
          <tr><th>Роль</th><td>{user.is_staff ? "Адміністратор" : "Користувач"}</td></tr>
        </tbody>
      </table>
      <p className="muted">
        {user.is_staff
          ? "Ви можете керувати турами, туроператорами й напрямками, зокрема видаляти записи."
          : "Ви можете додавати й редагувати тури. Видалення та керування туроператорами й напрямками доступні адміністраторам."}
      </p>
    </section>
  );
}
