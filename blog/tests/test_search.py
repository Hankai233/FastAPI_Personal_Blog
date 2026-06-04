class TestSearch:
    def test_search_empty_query(self, client):
        resp = client.get("/api/search", params={"q": ""})
        assert resp.status_code == 422

    def test_search_no_results(self, client):
        resp = client.get("/api/search", params={"q": "nonexistent"})
        assert resp.status_code == 200
        assert resp.json()["data"] == []
        assert resp.json()["total"] == 0
