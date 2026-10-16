import datetime
import os
import re
import sys
import unittest

os.environ["HUB_DISABLED"] = "1"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)

import app as showcase  # noqa: E402
import data  # noqa: E402

PUBLIC = [p["id"] for p in data.PROJECTS if not p.get("private")]


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as f:
        return f.read()


class Page(unittest.TestCase):
    def setUp(self):
        self.html = showcase.app.test_client().get("/").get_data(as_text=True)

    def test_every_public_project_has_a_demo_button_and_the_private_one_does_not(self):
        buttons = re.findall(r'data-demo="([\w-]+)"', self.html)
        self.assertEqual(sorted(buttons), sorted(PUBLIC))
        self.assertNotIn('data-demo="control"', self.html)

    def test_every_demo_button_has_a_demo_registered_in_the_scripts(self):
        js = read("static", "demos-a.js") + read("static", "demos-b.js")
        registered = set(re.findall(r"DEMOS\.(\w+)\s*=", js))
        self.assertEqual(registered, set(PUBLIC), "demos registered vs public projects")

    def test_scripts_and_styles_are_linked_in_order(self):
        order = [self.html.index(s) for s in ("/static/demos.js", "/static/demos-a.js", "/static/demos-b.js")]
        self.assertEqual(order, sorted(order), "core must load before the demos that use it")
        self.assertIn("/static/demos.css", self.html)

    def test_every_project_has_a_picture_or_a_designed_card_and_pictures_exist(self):
        for pid in PUBLIC:
            has_img = f"/static/shots/{pid}.jpg" in self.html
            art = re.search(r'class="shot art"[^>]*>\s*<span class="art-emoji">[^<]*</span><span class="art-name">%s' % re.escape(next(p["name"] for p in data.PROJECTS if p["id"] == pid)), self.html)
            self.assertTrue(has_img or art, pid)
            if has_img:
                path = os.path.join(ROOT, "static", "shots", pid + ".jpg")
                self.assertTrue(os.path.getsize(path) > 10_000, pid)
        self.assertNotIn("/static/shots/control.jpg", self.html)

    def test_private_apps_get_a_designed_card_never_a_screenshot(self):
        # these show a map of the owner's street, a family, saved trips and study sets: no screenshot may be published for them
        for pid in ("scout", "homebase", "tripmate", "cramly"):
            self.assertFalse(os.path.exists(os.path.join(ROOT, "static", "shots", pid + ".jpg")), pid)
            self.assertNotIn(f"/static/shots/{pid}.jpg", self.html)

    def test_stats_come_from_the_timeline_not_from_a_made_up_number(self):
        tl = showcase.build_timeline()
        self.assertIn(f"<b>{tl['days']}</b><span>days to build them</span>", self.html)
        self.assertIn(f"<b>{tl['commits']}</b><span>commits</span>", self.html)

    def test_the_tour_does_not_pop_up_over_the_showcase(self):
        self.assertIn('data-app="showcase" data-auto="0"', self.html)


class Timeline(unittest.TestCase):
    def test_timeline_data_is_consistent(self):
        ids = {p["id"] for p in data.PROJECTS}
        self.assertEqual({r[0] for r in data.TIMELINE}, ids)
        for pid, first, last, commits in data.TIMELINE:
            f, l = datetime.date.fromisoformat(first), datetime.date.fromisoformat(last)
            self.assertLessEqual(f, l, pid)
            self.assertLessEqual(l, datetime.date.fromisoformat(data.SNAPSHOT), pid)
            self.assertGreaterEqual(commits, 1, pid)

    def test_bars_fit_inside_the_axis_and_late_ones_are_labelled_inside_the_card(self):
        tl = showcase.build_timeline()
        self.assertEqual(len(tl["rows"]), len(data.PROJECTS))
        for r in tl["rows"]:
            self.assertGreaterEqual(r["left"], 0, r["id"])
            self.assertLessEqual(r["left"] + r["width"], 100.5, r["id"])
        self.assertEqual(tl["days"], 32)
        self.assertEqual(tl["commits"], sum(r[3] for r in data.TIMELINE))
        self.assertEqual([t["label"] for t in tl["ticks"]][0], "Sep 14")

    def test_rows_are_sorted_by_first_commit(self):
        firsts = [r["first"] for r in showcase.build_timeline()["rows"]]
        self.assertEqual(firsts, sorted(firsts))


class Style(unittest.TestCase):
    def test_no_blue_in_the_tour_or_the_demos(self):
        for f in ("static/tour.js", "static/demos.css", "static/demos.js", "static/demos-a.js", "static/demos-b.js"):
            text = read(*f.split("/")).lower()
            for blue in ("#5b93ff", "#3b82f6", "#4a86ff", "#2563eb", "#1d4ed8"):
                self.assertNotIn(blue, text, f"{f} has {blue}")

    def test_blue_projects_get_a_warm_hue(self):
        by = {p["id"]: p["hue"] for p in data.PROJECTS}
        for pid, hue in by.items():
            shown = data.WARM_HUE.get(pid, hue)
            self.assertFalse(185 <= shown <= 275, f"{pid} would show hue {shown}")

    def test_demo_text_is_never_put_in_as_html(self):
        for f in ("demos.js", "demos-a.js", "demos-b.js"):
            self.assertNotIn("innerHTML", read("static", f), f)


if __name__ == "__main__":
    unittest.main()
