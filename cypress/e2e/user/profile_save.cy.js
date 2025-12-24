const PATH_API = '/User/profile'
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Users Profile Save - /users/profile_save', () => {


  it('Status Code is 200', () => {

    const { street_1, street_2, city, country, zipcode, ...bodyMin } = validBody;
    saveProfile({ ...bodyMin, profile_username: 'profileuser' + Date.now(), email: `min${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Salva perfil com attachment (arquivo)', () => {

    // Cria um arquivo Blob para teste
    const file = new Blob(['teste de upload'], { type: 'text/plain' });
    saveProfile({ ...validBody, profile_username: 'attachuser' + Date.now(), email: `file${Date.now()}@test.com` }, file).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {

    saveProfile({ ...validBody, extra: 'foo', profile_username: 'profileuser' + Date.now(), email: `extra${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Falha com Content-Type application/json', () => {

    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { ...validBody, profile_username: 'profileuser' + Date.now(), email: `ct${Date.now()}@test.com` },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {

    saveProfile({ ...validBody, profile_username: "' OR 1=1 --", email: `sec${Date.now()}@test.com` }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {

    saveProfile({ ...validBody, profile_username: 'profileuser' + Date.now(), email: `hdr${Date.now()}@test.com` }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplos saves rápidos (rate limit)', () => {

    const requests = Array(10).fill(0).map(() =>
      saveProfile({ ...validBody, profile_username: 'profileuser' + Math.random(), email: `rl${Math.random()}@test.com` })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Falha ao salvar perfil com email já existente', () => {

    const uniqueEmail = `dup${Date.now()}@test.com`;
    const uniqueUsername = 'profileuser' + Date.now();
    saveProfile({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername }).then(() => {

      // Segunda tentativa com mesmo email/username
      saveProfile({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername }).then((response) => {
        expect([400, 409, 422]).to.include(response.status);
      });
    });
  });
});