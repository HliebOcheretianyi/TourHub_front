export default function ResponsePanel({ info }) {
  return (
    <aside className="panel">
      <h4>Відповідь сервера</h4>
      {!info ? (
        <p className="muted">Поки що запитів не було.</p>
      ) : (
        <>
          <p>
            <b>{info.method}</b> {info.url}
          </p>
          <p>
            Статус: <b className={info.status >= 400 || info.status === 0 ? "error" : "ok"}>{info.status}</b>{" "}
            {info.statusText}
          </p>
          <pre>{info.body === null ? "(порожнє тіло)" : JSON.stringify(info.body, null, 2)}</pre>
          <details>
            <summary>Хедери</summary>
            <pre>{JSON.stringify(info.headers, null, 2)}</pre>
          </details>
        </>
      )}
    </aside>
  );
}
