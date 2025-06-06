import { initializeTestEnvironment, assertSucceeds, assertFails, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'rules-test',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: readFileSync('firestore.rules', 'utf8')
    },
    storage: {
      host: 'localhost',
      port: 9199,
      rules: readFileSync('storage.rules', 'utf8')
    }
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

test('only booking participants can write chat uploads', async () => {
  await testEnv.withSecurityRulesDisabled(async context => {
    await context.firestore().collection('bookings').doc('b1').set({
      clientUid: 'client',
      providerUid: 'provider'
    });
  });

  const clientCtx = testEnv.authenticatedContext('client');
  await assertSucceeds(
    clientCtx.storage().ref('chat_uploads/b1/file.txt').putString('hello')
  );

  const providerCtx = testEnv.authenticatedContext('provider');
  await assertSucceeds(
    providerCtx.storage().ref('chat_uploads/b1/file.txt').putString('hello')
  );

  const otherCtx = testEnv.authenticatedContext('other');
  await assertFails(
    otherCtx.storage().ref('chat_uploads/b1/file.txt').putString('hello')
  );
});

test('profile images read and write rules', async () => {
  const ownerCtx = testEnv.authenticatedContext('user1');
  await assertSucceeds(
    ownerCtx.storage().ref('profile_images/user1/pic.png').putString('img')
  );

  const otherCtx = testEnv.authenticatedContext('user2');
  await assertFails(
    otherCtx.storage().ref('profile_images/user1/pic.png').putString('img')
  );

  await testEnv.withSecurityRulesDisabled(async context => {
    await context.storage().ref('profile_images/user1/pic.png').putString('img');
  });

  const anonCtx = testEnv.unauthenticatedContext();
  await assertSucceeds(
    anonCtx.storage().ref('profile_images/user1/pic.png').getDownloadURL()
  );
});
