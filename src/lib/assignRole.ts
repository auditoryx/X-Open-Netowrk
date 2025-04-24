export async function assignRole(uid: string, role: string) {
  try {
    const res = await fetch('/api/assign-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, role }),
    });

    if (!res.ok) {
      throw new Error(`Failed to assign role: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('assignRole error:', err);
    throw err;
  }
}
