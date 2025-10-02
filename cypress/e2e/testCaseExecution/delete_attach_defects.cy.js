// Testes automatizados para API: POST /test_case_execution/delete_attach_defects
// Segue o padrão completo do exemplo fornecido, cobrindo todos os cenários.
const PATH_API = '/Test%20Case%20Execution/delete_attach_defects'

describe('API - Test Case Execution Delete Attach Defects - /test_case_execution/delete_attach_defects', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validTcId = 101;
  const validBugId = 555;
  const validExecBugId = 222;

  function deleteAttachDefects(body, options = {}) {
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
  it('Remove bug de uma execução de test case com dados válidos', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    deleteAttachDefects({
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      deleteAttachDefects({
        token,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    deleteAttachDefects({
      token: validToken,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      deleteAttachDefects({
        token: validToken,
        project_id,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- tc_id inválido, ausente, tipos errados, limites ---
  it('Falha sem tc_id', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(tc_id => {
    it(`Falha com tc_id inválido (${JSON.stringify(tc_id)})`, () => {
      deleteAttachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- bug_id inválido, ausente, tipos errados, limites ---
  it('Falha sem bug_id', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(bug_id => {
    it(`Falha com bug_id inválido (${JSON.stringify(bug_id)})`, () => {
      deleteAttachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id,
        exec_bug_id: validExecBugId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- exec_bug_id inválido, ausente, tipos errados, limites ---
  it('Falha sem exec_bug_id', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(exec_bug_id => {
    it(`Falha com exec_bug_id inválido (${JSON.stringify(exec_bug_id)})`, () => {
      deleteAttachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId,
      extra: 'foo'
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
          tc_id: validTcId,
          bug_id: validBugId,
          exec_bug_id: validExecBugId
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
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    deleteAttachDefects({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      deleteAttachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    deleteAttachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      bug_id: validBugId,
      exec_bug_id: validExecBugId
    })
      .then(() => deleteAttachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        bug_id: validBugId,
        exec_bug_id: validExecBugId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});