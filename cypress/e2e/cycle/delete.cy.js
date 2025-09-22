// Testes automatizados para API: POST /defects/delete
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)

describe('API - Defects Delete - /defects/delete', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validDefectId = 101;

  function defectsDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/Defect/Delete',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Deleta defeito com todos os campos obrigatórios válidos', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    defectsDelete({
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsDelete({
        token,
        project_id: validProjectId,
        id: [validDefectId]
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        id: [validDefectId]
      };
      delete body[field];
      defectsDelete(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsDelete({
        token: validToken,
        project_id,
        id: [validDefectId]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // id com valores inválidos
  [
    null, '', 'abc', 0, -1, 999999999, {}, true, false,
    [null], [''], ['abc'], [0], [-1], [999999999], [{}], [true], [false], []
  ].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      defectsDelete({
        token: validToken,
        project_id: validProjectId,
        id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId],
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: '/Defect/Delete',
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          id: [validDefectId]
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
      url: '/Defect/Delete',
      body: {
        token: validToken,
        project_id: validProjectId,
        id: [validDefectId]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas deleções rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsDelete({
        token: validToken,
        project_id: validProjectId,
        id: [validDefectId]
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite deleções duplicadas rapidamente', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId]
    }).then(() =>
      defectsDelete({
        token: validToken,
        project_id: validProjectId,
        id: [validDefectId]
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});