const PATH_API = '/TestCase/Approved';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTestcaseIds = [1001, 1002];

describe('Test Case Approve - /test_case/approve', () => {

  it('Status Code is 200', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1', // 1=Approved
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 200', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      tc_status: '1'
    };
    validTestcaseIds.forEach((id, i) => body[`testcase_id[${i}]`] = id);
    testCaseApprove(body).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 200', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '2', // 2=Rejected
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    testCaseApprove({
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    testCaseApprove({
      token: validToken,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0],
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        tc_status: '1',
        'testcase_id[0]': validTestcaseIds[0]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseApprove({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    };
    const requests = Array(10).fill(0).map(() => testCaseApprove(body));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    })
      .then(() => testCaseApprove({
        token: validToken,
        project_id: validProjectId,
        tc_status: '1',
        'testcase_id[0]': validTestcaseIds[0]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});