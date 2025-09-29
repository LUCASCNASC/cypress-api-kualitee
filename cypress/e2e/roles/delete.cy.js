// Testes automatizados para API: POST /roles/delete
const PATH_API = '/Roles/Delete'

describe('API - Roles Delete - /roles/delete', () => {
  const validToken = 'token_valido_aqui';
  const validIdArray = [123];
  const validIdSingle = 123;

  function rolesDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Deleta role com token válido e id[0] inteiro (array)', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdArray[0] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Testando multiplos ids
  it('Deleta múltiplos roles com vários id[0], id[1]...', () => {
    rolesDelete({ token: validToken, 'id[0]': 111, 'id[1]': 222, 'id[2]': 333 }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    rolesDelete({ 'id[0]': validIdSingle }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      rolesDelete({ token, 'id[0]': validIdSingle }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- id[0] inválido, ausente, tipos errados, limites ---
  it('Falha sem id[0]', () => {
    rolesDelete({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(badId => {
    it(`Falha com id[0] inválido (${JSON.stringify(badId)})`, () => {
      rolesDelete({ token: validToken, 'id[0]': badId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdSingle, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, 'id[0]': validIdSingle },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, 'id[0]': validIdSingle },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    rolesDelete({ token: "' OR 1=1 --", 'id[0]': validIdSingle }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdSingle }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      rolesDelete({ token: validToken, 'id[0]': validIdSingle })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    rolesDelete({ token: validToken, 'id[0]': validIdSingle })
      .then(() => rolesDelete({ token: validToken, 'id[0]': validIdSingle }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});