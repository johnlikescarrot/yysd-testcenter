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
    categoryNameZh: " thế giới Đại học xếp hạng ",
    year: 2027,
    isSubject: false,
    path: "/world-university-rankings",
  },
  {
    slug: "computer-science-information-systems",
    categorySlug: "computer-science",
    categoryName: "Computer Science and Information Systems",
    categoryNameZh: " khoa học máy tính biến thể của | hệ thống thông tin ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/computer-science-information-systems",
  },
  {
    slug: "data-science-artificial-intelligence",
    categorySlug: "data-science",
    categoryName: "Data Science and Artificial Intelligence",
    categoryNameZh: " dữ liệu khoa học biến thể của | trí tuệ nhân tạo ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/data-science-artificial-intelligence",
  },
  {
    slug: "business-management-studies",
    categorySlug: "business-management",
    categoryName: "Business and Management Studies",
    categoryNameZh: " kinh doanh biến thể của | giám sát nghiên cứu ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/business-management-studies",
  },
  {
    slug: "accounting-finance",
    categorySlug: "accounting-finance",
    categoryName: "Accounting and Finance",
    categoryNameZh: " kế toán biến thể của | ngân hàng ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/accounting-finance",
  },
  {
    slug: "electrical-electronic-engineering",
    categorySlug: "electrical-electronic",
    categoryName: "Engineering - Electrical and Electronic",
    categoryNameZh: " điện biến thể của | kỹ thuật điện tử ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/electrical-electronic-engineering",
  },
  {
    slug: "mechanical-aeronautical-manufacturing-engineering",
    categorySlug: "mechanical-engineering",
    categoryName: "Engineering - Mechanical",
    categoryNameZh: " kỹ thuật cơ khí ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/mechanical-aeronautical-manufacturing-engineering",
  },
  {
    slug: "mathematics",
    categorySlug: "mathematics",
    categoryName: "Mathematics",
    categoryNameZh: " Toán ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/mathematics",
  },
  {
    slug: "law-legal-studies",
    categorySlug: "law",
    categoryName: "Law and Legal Studies",
    categoryNameZh: " luật ",
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
    categoryNameZh: " kinh tế học biến thể của | đo lường kinh tế học ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/economics-econometrics",
  },
  {
    slug: "art-design",
    categorySlug: "art-design",
    categoryName: "Art and Design",
    categoryNameZh: " nghệ thuật biến thể của | thiết kế ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/art-design",
  },
  {
    slug: "biological-sciences",
    categorySlug: "biological-sciences",
    categoryName: "Biological Sciences",
    categoryNameZh: " sinh vật khoa học ",
    year: 2026,
    isSubject: true,
    path: "/university-subject-rankings/biological-sciences",
  },
];

export const BASE = "https://www.topuniversities.com";
