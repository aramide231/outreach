export default function DbBanner({ usingDb, dbReady, dbError, loading }) {
  if (!usingDb) {
    return (
      <div className="db-banner warn">
        <strong>Not on Supabase yet</strong>
        <span>
          Add your Supabase keys so every reacher&apos;s phone sees the same souls.
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="db-banner">
        <strong>Loading shared log…</strong>
        <span>Pulling souls from Supabase for the whole team.</span>
      </div>
    );
  }

  if (dbError) {
    const needsTable =
      /schema cache|does not exist|Could not find the table/i.test(dbError);

    return (
      <div className="db-banner error">
        <strong>{needsTable ? 'Database table missing' : 'Database error'}</strong>
        <span>
          {needsTable
            ? 'Supabase is connected, but the shared souls table is not created yet. Send the project Database password so it can be set up once for everyone.'
            : dbError}
        </span>
      </div>
    );
  }

  if (dbReady) {
    return (
      <div className="db-banner ok">
        <strong>Shared on Supabase</strong>
        <span>
          Any reacher who adds a name or marks Saved / Filled — it shows on every
          phone.
        </span>
      </div>
    );
  }

  return null;
}
