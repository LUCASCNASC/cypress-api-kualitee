const PATH_API = '/User/post_auth_signin'
const validToken = Cypress.env('VALID_TOKEN');

const validEmail = 'usuario@exemplo.com';
const validPassword = 'senhaSegura';
const validSubdomain = 'meusubdominio';

describe('API rest - Login - /auth/signin - Testes Avançados', () => {

  function login(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  it('Status Code 200', () => {
    login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('token', 'user', 'expires_in'); // ajuste para o contrato real
      expect(response.headers).to.have.property('content-type').and.include('application/json');
    });
  });

  // --- NEGATIVOS: Campos inválidos, ausentes, vazios, tipos errados ---
  const invalidScenarios = [
    { desc: 'Email inválido', body: { email_id: 'naoeumemail', password: validPassword, subdomain: validSubdomain } },
    { desc: 'Senha inválida', body: { email_id: validEmail, password: 'senhaErrada', subdomain: validSubdomain } },
    { desc: 'Subdomínio inválido', body: { email_id: validEmail, password: validPassword, subdomain: 'subX' } },
    { desc: 'Email ausente', body: { password: validPassword, subdomain: validSubdomain } },
    { desc: 'Senha ausente', body: { email_id: validEmail, subdomain: validSubdomain } },
    { desc: 'Subdomínio ausente', body: { email_id: validEmail, password: validPassword } },
    { desc: 'Todos os campos ausentes', body: {} },
    { desc: 'Todos os campos vazios', body: { email_id: '', password: '', subdomain: '' } },
    { desc: 'Campos preenchidos só com espaços', body: { email_id: '   ', password: '   ', subdomain: '   ' } },
    { desc: 'Campo extra', body: { email_id: validEmail, password: validPassword, subdomain: validSubdomain, extra: 'foo' } },
    { desc: 'Email nulo', body: { email_id: null, password: validPassword, subdomain: validSubdomain } },
    { desc: 'Senha nula', body: { email_id: validEmail, password: null, subdomain: validSubdomain } },
    { desc: 'Subdomínio nulo', body: { email_id: validEmail, password: validPassword, subdomain: null } },
    { desc: 'Email como número', body: { email_id: 12345, password: validPassword, subdomain: validSubdomain } },
    { desc: 'Senha como array', body: { email_id: validEmail, password: [1,2,3], subdomain: validSubdomain } },
    { desc: 'Subdomínio como objeto', body: { email_id: validEmail, password: validPassword, subdomain: {foo:"bar"} } },
    { desc: 'Campos com emoji', body: { email_id: '😀@mail.com', password: '😀', subdomain: '😀' } },
    { desc: 'SQL injection no email', body: { email_id: "' OR 1=1 --", password: validPassword, subdomain: validSubdomain } },
    { desc: 'XSS na senha', body: { email_id: validEmail, password: '<script>alert(1)</script>', subdomain: validSubdomain } },
    { desc: 'Campos com unicode', body: { email_id: 'тест@mail.com', password: 'пароль', subdomain: 'тест' } },
    { desc: 'Senha igual ao email', body: { email_id: validEmail, password: validEmail, subdomain: validSubdomain } },
    { desc: 'Senha comum', body: { email_id: validEmail, password: '123456', subdomain: validSubdomain } },
    { desc: 'Subdomínio de outra empresa', body: { email_id: validEmail, password: validPassword, subdomain: 'empresaerrada' } }
  ];
  invalidScenarios.forEach(({ desc, body }) => {
    it(`Deve falhar: ${desc}`, () => {
      login(body).then((response) => {
        expect([400, 401, 404]).to.include(response.status);
        // Se o contrato trouxer mensagem, valide também:
        expect(response.headers['content-type']).to.include('application/json');
        // expect(response.body).to.have.property('message');
      });
    });
  });

  // --- NEGATIVO: Content-Type errado ---
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

  // --- NEGATIVO: Métodos HTTP errados ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach((method) => {
    it(`Deve falhar com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: Rate Limit ---
  it('Deve retornar erro após múltiplas tentativas rápidas (rate limit)', () => {
    // Ajuste a quantidade conforme a política da API
    const requests = Array(10).fill(0).map(() => login({ email_id: validEmail, password: 'senhaErrada', subdomain: validSubdomain }));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- NEGATIVO: Requisição duplicada rápida ---
  it('Deve tratar requisições duplicadas', () => {
    login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain })
      .then(() => login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

  // --- NEGATIVO: Encoding especial ---
  it('Falha com campos encoding especial', () => {
    login({ email_id: encodeURIComponent(validEmail), password: encodeURIComponent(validPassword), subdomain: encodeURIComponent(validSubdomain) }).then((response) => {
      expect([400, 401, 404]).to.include(response.status);
    });
  });

  // --- CONTRATO: Não vazar info sensível ---
  it('Resposta não deve vazar stacktrace ou SQL', () => {
    login({ email_id: "' OR 1=1 --", password: 'foo', subdomain: 'bar' }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- HEADERS: CORS, content-type ---
  it('Headers devem incluir CORS e content-type', () => {
    login({ email_id: validEmail, password: validPassword, subdomain: validSubdomain }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

});