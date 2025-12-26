const PATH_API = '/User/post_auth_signin'
const validToken = Cypress.env('VALID_TOKEN');

const validEmail = 'usuario@exemplo.com';
const validPassword = 'senhaSegura';
const validSubdomain = 'meusubdominio';

describe('API rest - Login - /auth/signin - Testes Avançados', () => {
  
  it('Status Code is 200', () => {
    login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('token', 'user', 'expires_in'); // ajuste para o contrato real
      expect(response.headers).to.have.property('content-type').and.include('application/json');
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { email_id: validEmail, password: validPassword, subdomain: validSubdomain },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Deve retornar erro após múltiplas tentativas rápidas (rate limit)', () => {
    // Ajuste a quantidade conforme a política da API
    const requests = Array(10).fill(0).map(() => login({ email_id: validEmail, password: 'senhaErrada', subdomain: validSubdomain }));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Deve tratar requisições duplicadas', () => {
    login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain })
      .then(() => login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

  it('Falha com campos encoding especial', () => {
    login({ email_id: encodeURIComponent(validEmail), password: encodeURIComponent(validPassword), subdomain: encodeURIComponent(validSubdomain) }).then((response) => {
      expect([400, 401, 404]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace ou SQL', () => {
    login({ email_id: "' OR 1=1 --", password: 'foo', subdomain: 'bar' }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem incluir CORS e content-type', () => {
    login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
});