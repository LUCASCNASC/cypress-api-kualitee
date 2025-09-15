// Testes automatizados para API: POST /test_case/delete
// Segue o padrão dos testes Cypress do projeto

describe('API - Test Case Delete - /test_case/delete', () => {
  const BASE_URL = 'https://apiss.kualitee.com/api/v2';
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validIds = [1001, 1002]; // Substitua por ids de casos de teste válidos do seu ambiente

  // Função utilitária para chamada da API
  function testCaseDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/TestCase/Deleted`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: Um id ---
  it('Deleta um caso de teste com token, project_id e id[0] válidos', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Vários ids ---
  it('Deleta múltiplos casos de teste', () => {
    const body = {
      token: validToken,
      project_id: validProjectId
    };
    validIds.forEach((id, i) => body[`id[${i}]`] = id);
    testCaseDelete(body).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    testCaseDelete({
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      testCaseDelete({
        token,
        project_id: validProjectId,
        'id[0]': validIds[0]
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campo obrigatório ausente ---
  it('Falha sem project_id', () => {
    testCaseDelete({
      token: validToken,
      'id[0]': validIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem id[0]', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'id[0]'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          'id[0]': validIds[0]
        };
        body[field] = value;
        testCaseDelete(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0],
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/TestCase/Deleted`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          'id[0]': validIds[0]
        },
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
      url: `${BASE_URL}/TestCase/Deleted`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'id[0]': validIds[0]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas deleções rápidas (rate limit)', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    };
    const requests = Array(10).fill(0).map(() => testCaseDelete(body));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita deleções idênticas sequenciais ---
  it('Permite deleções duplicadas rapidamente', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    })
      .then(() => testCaseDelete({
        token: validToken,
        project_id: validProjectId,
        'id[0]': validIds[0]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});