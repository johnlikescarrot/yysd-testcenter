/** QS TopUniversities targets for official fetch. */

export type QsTarget = {
  slug: string;
  categorySlug: string;
  categoryName: string;
  categoryNameZh: string;
  year: number;
  isSubject: boolean;
  path: string;
};

export const QS_TARGETS: QsTarget[] = [
  {
    slug: "world",
    categorySlug: "world",
    categoryName: "World University Rankings",
    categoryNameZh: " thế giới đại học bài danh ",
    year: 2027,
    isSubject: false,
    path: "/world-university-rankings",
  },
  {
    slug: "computer-science-information-systems",
    categorySlug: "computer-science",
    categoryName: "Computer Science and Information Systems",
    categoryNameZh: " Khoa học máy tính và tin tức hệ thống ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/computer-science-information-systems",
  },
  {
    slug: "data-science-artificial-intelligence",
    categorySlug: "data-science",
    categoryName: "Data Science and Artificial Intelligence",
    categoryNameZh: " số liệu khoa học cùng người công trí tuệ nhân tạo ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/data-science-artificial-intelligence",
  },
  {
    slug: "business-management-studies",
    categorySlug: "business-management",
    categoryName: "Business and Management Studies",
    categoryNameZh: " Kinh doanh và Quản trị nghiên cứu ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/business-management-studies",
  },
  {
    slug: "accounting-finance",
    categorySlug: "accounting-finance",
    categoryName: "Accounting and Finance",
    categoryNameZh: " Kế toán và tài chính ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/accounting-finance",
  },
  {
    slug: "electrical-electronic-engineering",
    categorySlug: "electrical-electronic",
    categoryName: "Engineering - Electrical and Electronic",
    categoryNameZh: " điện khí và điện tử công trình ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/electrical-electronic-engineering",
  },
  {
    slug: "mechanical-aeronautical-manufacturing-engineering",
    categorySlug: "mechanical-engineering",
    categoryName: "Engineering - Mechanical",
    categoryNameZh: " máy móc công trình ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/mechanical-aeronautical-manufacturing-engineering",
  },
  {
    slug: "mathematics",
    categorySlug: "mathematics",
    categoryName: "Mathematics",
    categoryNameZh: " Toán học ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/mathematics",
  },
  {
    slug: "law-legal-studies",
    categorySlug: "law",
    categoryName: "Law and Legal Studies",
    categoryNameZh: " luật học ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/law-legal-studies",
  },
  {
    slug: "education-training",
    categorySlug: "education",
    categoryName: "Education and Training",
    categoryNameZh: " Giáo dục ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/education-training",
  },
  {
    slug: "economics-econometrics",
    categorySlug: "economics",
    categoryName: "Economics and Econometrics",
    categoryNameZh: " Kinh tế học và đo Kinh tế học ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/economics-econometrics",
  },
  {
    slug: "art-design",
    categorySlug: "art-design",
    categoryName: "Art and Design",
    categoryNameZh: " Nghệ thuật và xếp đặt thiết kế ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/art-design",
  },
  {
    slug: "biological-sciences",
    categorySlug: "biological-sciences",
    categoryName: "Biological Sciences",
    categoryNameZh: " Sinh học khoa học ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/biological-sciences",
  },
];

export const BASE = "https://www.topuniversities.com";
