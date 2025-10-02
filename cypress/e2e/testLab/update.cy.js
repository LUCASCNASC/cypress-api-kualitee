// Testes automatizados para API: POST /manage_test_case/update
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)
const PATH_API = '/TestLab/AddTestCasesCycle'

describe('API - Manage Test Case Update - /manage_test_case/update', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  // Exemplo de node[to] e node[from] baseado na documentação
  const validNodeTo = { parent: { id: 1001, _type: 'cycle' } };
  const validNodeFrom = { parent: { id: 2001 }, name: "TCExample", _type: "tc", checked: true };

  function manageTestCaseUpdate(body, options = {}) {
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
  it('Adiciona casos de teste ao ciclo com todos os campos obrigatórios válidos', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    manageTestCaseUpdate({
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      manageTestCaseUpdate({
        token,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'node[to]', 'node[from]'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      };
      delete body[field];
      manageTestCaseUpdate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      manageTestCaseUpdate({
        token: validToken,
        project_id,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // node[to] inválidos
  [null, '', {}, [], 0, -1, 'abc', true, false].forEach(nodeTo => {
    it(`Falha com node[to] inválido (${JSON.stringify(nodeTo)})`, () => {
      manageTestCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        "node[to]": nodeTo,
        "node[from]": validNodeFrom
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // node[from] inválidos
  [null, '', {}, [], 0, -1, 'abc', true, false].forEach(nodeFrom => {
    it(`Falha com node[from] inválido (${JSON.stringify(nodeFrom)})`, () => {
      manageTestCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": nodeFrom
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom,
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
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          "node[to]": validNodeTo,
          "node[from]": validNodeFrom
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
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    manageTestCaseUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom,
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      manageTestCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(() =>
      manageTestCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});