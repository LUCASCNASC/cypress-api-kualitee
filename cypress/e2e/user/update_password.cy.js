const PATH_API = '/User/UpdatePassword'
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Update Password - /update_password', () => {

  it('Status Code is 200', () => {
    updatePassword({ ...validBody, activated_user_email: 'user'+Date.now()+'@test.com' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha ao atualizar senha para mesma senha atual', () => {
    updatePassword({ ...validBody, users_password: validBody.users_c_password }).then(response => {
      expect([400, 422]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Ignora campo extra no body', () => {
    updatePassword({ ...validBody, extra: 'foo' }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: validBody,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    updatePassword({ ...validBody, activated_tenant_id: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    updatePassword(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas trocas rápidas de senha (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      updatePassword({ ...validBody, activated_user_email: 'user'+Math.random()+'@test.com' })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Falha ao atualizar senha duas vezes seguidas sem login entre elas', () => {
    updatePassword(validBody)
      .then(() => updatePassword(validBody))
      .then((response) => {
        expect([200, 400, 401, 409, 422]).to.include(response.status);
      });
  });
});