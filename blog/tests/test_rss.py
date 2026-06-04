class TestRSS:
    def test_rss_returns_xml(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "RSS Test",
            "slug": "rss-test",
            "content_md": "RSS content",
            "status": "published",
        }, headers=auth_headers)
        resp = client.get("/api/rss")
        assert resp.status_code == 200
        assert "application/rss+xml" in resp.headers["content-type"]
        assert "<rss" in resp.text or "<feed" in resp.text
