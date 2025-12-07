# Prime number

A **prime number** is a natural number greater than 1 that is divisible only by 1 and itself, having exactly two distinct positive divisors. These numbers form the foundational "atoms" of the integers under multiplication, as established by the fundamental theorem of arithmetic, which states that every integer greater than 1 can be expressed uniquely as a product of prime numbers, disregarding order. The concept dates back to ancient times, with Euclid providing the first known proof around 300 BCE in his *Elements* that there are infinitely many primes, demonstrating this by assuming a finite list and constructing a number (their product plus one) that must have a prime factor not in the list.

Primes have intrigued mathematicians for millennia due to their irregular distribution and elusive patterns, influencing key developments in number theory, such as the prime number theorem, which approximates the density of primes up to a large number *x* as roughly *x* / ln(*x*). Beyond pure mathematics, prime numbers underpin modern cryptography, particularly in systems like RSA, where the security relies on the computational difficulty of factoring the product of two large distinct primes into its components. Ongoing research explores properties like twin primes—pairs differing by 2— and the search for ever-larger primes, often using specialized algorithms to verify primality for numbers with tens of millions of digits as of 2025.

## Basic Concepts

### Definition

A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. Equivalently, if \( p \) is a prime number, then its only positive divisors \( d \) satisfy \( 1 \leq d \leq p \) and \( d = 1 \) or \( d = p \).

This modern definition evolved from earlier formulations in ancient Greek mathematics. In Euclid's *Elements* (circa 300 BCE), a prime number was described as "that which is measured by a unit alone," meaning it has no proper divisors other than the unit 1, which aligns conceptually with the contemporary view but is phrased in terms of measurement rather than explicit divisors.

Related terminology distinguishes primes within the natural numbers and broader algebraic structures. A composite number is a natural number greater than 1 that is not prime, expressible as a product of two or more prime numbers via the fundamental theorem of arithmetic. The number 1 is neither prime nor composite. In the ring of integers \( \mathbb{Z} \), the units are the elements \( \pm 1 \), which have multiplicative inverses within \( \mathbb{Z} \) and are excluded from consideration as primes. In more general commutative rings, irreducible elements are nonzero, non-unit elements that cannot be expressed as a product of two non-unit elements; while all prime elements are irreducible, the converse does not hold in arbitrary integral domains.

### Examples

Prime numbers, defined as natural numbers greater than 1 with no positive divisors other than 1 and themselves, are best understood through concrete examples that demonstrate their distribution and patterns. The smallest prime is 2, which stands out as the only even prime number, since all other even numbers greater than 2 are divisible by 2 and thus composite.

The first 25 prime numbers, comprising all primes less than 100, are as follows:

- 2, 3, 5, 7, 11, 13, 17, 19, 23, 29
- 31, 37, 41, 43, 47, 53, 59, 61, 67, 71
- 73, 79, 83, 89, 97

These examples illustrate how primes become sparser among larger integers.

Notable patterns emerge among primes, such as twin primes, which are pairs of primes differing by 2. The first few twin prime pairs are (3, 5), (5, 7), (11, 13), (17, 19), and (29, 31). Another pattern involves Mersenne primes, which are primes of the form $2^p - 1$ where $p$ is itself prime. Examples include $2^2 - 1 = 3$, $2^3 - 1 = 7$, $2^5 - 1 = 31$, and $2^7 - 1 = 127$.

Basic observations about primes reveal that their density decreases as numbers grow, with the gaps between consecutive primes generally increasing. For instance, while early gaps are small (e.g., 1 between 2 and 3), larger gaps appear later, such as 8 between 89 and 97, and even wider separations beyond 100. There is no simple formula to generate the $n$th prime directly, underscoring the irregular yet structured nature of their occurrence.

Visual representations aid in building intuition for primes. The Sieve of Eratosthenes provides a step-by-step visualization: starting with numbers from 2 to 100 listed in a grid, multiples of 2 are marked as composite, followed by multiples of the next unmarked number (3), then 5, and so on up to the square root of 100 (about 10), leaving the unmarked numbers as the 25 primes up to 97. Similarly, the Ulam spiral arranges positive integers in a clockwise spiral on a grid, with primes highlighted (often in black or red), revealing striking diagonal lines and clusters that suggest underlying patterns in prime distribution despite their apparent randomness.

## Historical Development

### Ancient and Early Modern Periods

The concept of prime numbers emerged in ancient Greece as part of early number theory. In his *Elements*, composed around 300 BCE, Euclid provided a foundational definition in Book VII: a prime number is one measured by a unit alone, meaning it has no divisors other than itself and one. Euclid further established key properties, such as the Euclidean algorithm for finding greatest common divisors, which relies on the structure of primes.

A landmark achievement was Euclid's proof of the infinitude of primes, stated and proved in Proposition 20 of Book IX: there are infinitely many prime numbers. This theorem, argued through contradiction by assuming a finite list of primes and constructing a new one as their product plus one, underscored the endless nature of primes and influenced all subsequent number theory. Around 240 BCE, Eratosthenes of Cyrene developed an efficient method for identifying primes up to a given limit, known as the sieve of Eratosthenes; the earliest surviving description appears in Nicomachus of Gerasa's *Introduction to Arithmetic* (c. 100 CE), where it is portrayed as a process of sifting odds by eliminating multiples of successive primes starting from 3.

Medieval Islamic scholars built upon Greek foundations, integrating primes into broader algebraic and arithmetic studies. Abu Bakr al-Karaji (c. 953–1029), in works like *Al-Fakhri fi al-jabr wa al-muqabala*, advanced algebraic techniques such as polynomial operations and mathematical induction. These contributions bridged arithmetic and emerging algebra during the Islamic Golden Age.

The early modern period saw renewed interest in primes through correspondence and treatises. In 1640, Pierre de Fermat stated in a letter to Bernard Frénicle de Bessy what is now called Fermat's Little Theorem: if \( p \) is a prime and \( a \) is an integer not divisible by \( p \), then \( a^{p-1} \equiv 1 \pmod{p} \). Fermat offered no proof, but the result highlighted modular arithmetic's connection to primes. Later, in 1736, Leonhard Euler provided the first rigorous proof of Fermat's theorem in his paper "Theorematum quorundam ad numeros primos spectantium demonstratio I," while also advancing factorization methods in number theory, including applications to cyclotomic polynomials and prime distribution. Euler's work solidified primes as central to analytic approaches in the 18th century.

### Debates on the Primality of One

In ancient Greek mathematics, the concept of prime numbers was introduced without explicitly addressing the status of 1, leading to initial ambiguity. Euclid, in his *Elements* (circa 300 BCE), defined a prime number as one "measured by a unit alone," a phrasing that technically applies to 1 since it has no divisors other than itself. However, Euclid's treatments, such as his proof of the infinitude of primes in Book IX, Proposition 20, implicitly exclude 1 by considering numbers greater than 1 and listing primes starting from 2, reflecting the Pythagorean view that 1 was not a proper number but a unit of measure.

This ambiguity persisted into the medieval period, where 1 was sometimes treated as prime but increasingly excluded for practical reasons. In his *Liber Abaci* (1202), Fibonacci described "incomposite" numbers—equivalent to primes—starting from 2 and omitting 1, marking an early shift toward exclusion in Western mathematics to align with factorization practices in arithmetic problems.

By the 19th century, a consensus emerged to firmly exclude 1 from primes, driven by the need to uphold key theorems in number theory. Carl Friedrich Gauss, in his *Disquisitiones Arithmeticae* (1801), stated that "a composite number can be resolved into prime factors in only one way," implying that primes must be greater than 1 to ensure the uniqueness of this decomposition, as including 1 would allow trivial multiplications that violate the theorem's intent. Gauss's influence solidified this view, echoed by contemporaries like Legendre, who proved the existence of prime factorizations excluding units like 1.

In modern number theory, 1 is classified as neither prime nor composite, a standard adopted by the early 20th century for consistency across theorems. This exclusion stems from 1 having exactly one positive divisor (itself), unlike primes which have exactly two (1 and themselves), and from its status as a unit that would undermine the unique factorization theorem if treated as prime. Dirichlet reinforced this in his *Vorlesungen über Zahlentheorie* (1863), noting it is "convenient not to include unity among the prime numbers" to simplify analytic results like those on primes in progressions.

### 19th- and 20th-Century Advances

In 1837, Peter Gustav Lejeune Dirichlet proved that if \(a\) and \(d\) are positive integers with \(\gcd(a, d) = 1\), then there are infinitely many primes in the arithmetic progression \(a + nd\) for \(n = 0, 1, 2, \dots\). This theorem extended Euclid's result on the infinitude of primes by showing their infinite distribution across certain progressions, marking the birth of analytic number theory through Dirichlet's introduction of L-functions and characters.

Building on this, Bernhard Riemann's 1859 paper "Ueber die Anzahl der Primzahlen unter einer gegebenen Grösse" analyzed the Riemann zeta function \(\zeta(s) = \sum_{n=1}^\infty n^{-s}\) for complex \(s\), deriving its functional equation and conjecturing that all nontrivial zeros lie on the line \(\Re(s) = 1/2\). These analytic tools linked the zeros of \(\zeta(s)\) to the distribution of primes, providing a framework for estimating the prime-counting function \(\pi(x)\) and influencing subsequent developments in prime theory.

The culmination of these ideas came in 1896, when Jacques Hadamard and Charles Jean de la Vallée Poussin independently proved the Prime Number Theorem, stating that \(\pi(x) \sim x / \ln x\) as \(x \	o \infty\). Their proofs relied on complex analysis of the zeta function, showing no zeros on the line \(\Re(s) = 1\) and confirming the asymptotic density of primes as approximately \(1 / \ln n\) near \(n\).

At the 1900 International Congress of Mathematicians, David Hilbert posed his eighth problem, which encompassed the Riemann Hypothesis on zeta zeros, the Goldbach conjecture (every even integer greater than 2 as a sum of two primes), the twin prime conjecture (infinitely many primes differing by 2), and related questions on prime representations. Hilbert emphasized resolving these to deepen understanding of prime distribution, including bounds on \(\pi(x) - \mathrm{Li}(x)\) and applications to algebraic number fields.

Throughout the 20th century, the Goldbach and twin prime conjectures persisted as unsolved, despite significant progress via sieve methods. In 1919, Viggo Brun developed his sieve to show that the sum of reciprocals of twin primes converges to Brun's constant (approximately 1.902), implying twin primes are sparser than all primes. For Goldbach, Ivan Vinogradov proved in 1937 that every sufficiently large odd integer is the sum of three primes, advancing a related weak form, while computational verifications extended to enormous even numbers without counterexamples. These efforts highlighted the conjectures' resilience and spurred innovations in sieve theory and computational number theory.

## Elementary Properties

### Unique Factorization Theorem

The **Fundamental Theorem of Arithmetic**, also known as the Unique Factorization Theorem, asserts that every integer greater than 1 can be expressed as a product of prime numbers in a unique way, disregarding the order of the factors. This theorem establishes the primes as the fundamental building blocks of the natural numbers under multiplication.

Formally, for any integer \( n \u003e 1 \), there exist distinct primes \( p_1, p_2, \dots, p_k \) and positive integers \( a_1, a_2, \dots, a_k \) such that
\[
n = p_1^{a_1} p_2^{a_2} \cdots p_k^{a_k}.
\]
This representation is unique up to the ordering of the primes. The theorem was rigorously proved by Carl Friedrich Gauss in his 1801 work *Disquisitiones Arithmeticae*, building on earlier ideas from Euclid.

The proof consists of two main parts: existence and uniqueness. Existence follows from the well-ordering principle of the natural numbers. Consider the set of integers greater than 1 that cannot be factored into primes; if nonempty, it has a least element \( m \). Since \( m \) is composite (as 1 is excluded and primes factor trivially), it has a divisor \( d \) with \( 1 \u003c d \u003c m \), so \( d \) factors into primes by minimality, implying \( m \) does too—a contradiction. Thus, every integer greater than 1 has a prime factorization. Uniqueness relies on Euclid's lemma, which states that if a prime \( p \) divides a product \( ab \), then \( p \) divides \( a \) or \( p \) divides \( b \). This lemma, proved in Euclid's *Elements* (Book VII, Proposition 30), extends by induction to products of more factors. Assuming two distinct factorizations for \( n \), Euclid's lemma implies one prime from the first must divide the second, leading to identical multisets of primes by contradiction.

This theorem underpins many computational tools in number theory, notably the greatest common divisor (gcd) and least common multiple (lcm) of integers. Given prime factorizations \( m = \prod p_i^{b_i} \) and \( n = \prod p_i^{c_i} \) (with exponents zero where primes are absent), the gcd is \( \prod p_i^{\min(b_i, c_i)} \) and the lcm is \( \prod p_i^{\max(b_i, c_i)} \), satisfying \( \gcd(m, n) \cdot \operatorname{lcm}(m, n) = m \cdot n \). These operations, efficient via prime factorization, are essential for algorithms like the Euclidean algorithm extensions.

While the theorem holds in the ring of integers \( \mathbb{Z} \), it fails in certain other integral domains, such as some rings of algebraic integers, where unique factorization into irreducibles does not occur.

### Infinitude of Primes

One of the most celebrated results in number theory is the infinitude of prime numbers, first proved by the ancient Greek mathematician Euclid around 300 BCE in Proposition 20 of Book IX of his *Elements*. Euclid's proof proceeds by contradiction: assume there are only finitely many primes, say \( p_1, p_2, \dots, p_k \), where \( p_1 = 2 \u003c p_2 = 3 \u003c \dots \u003c p_k \). Construct the integer \( N = p_1 p_2 \cdots p_k + 1 \). Since \( N \u003e 1 \), it must have at least one prime factor \( p \). However, \( p \) cannot equal any \( p_i \), because dividing \( N \) by \( p_i \) leaves a remainder of 1 for each \( i \). Thus, \( p \) is a prime not in the original list, contradicting the assumption that the list was complete. Therefore, there must be infinitely many primes.

The construction can be expressed formally as
\[
N = \prod_{i=1}^k p_i + 1,
\]
where \( N \) is greater than 1 and hence divisible by some prime outside the set \( \{p_1, \dots, p_k\} \). This argument relies briefly on the fact that every integer greater than 1 has a prime factor, a key step toward the unique factorization of integers.

A simple variation of Euclid's proof establishes the infinitude of odd primes. Since 2 is the only even prime and Euclid's argument yields infinitely many primes overall, there must be infinitely many odd primes as well. Alternatively, assuming a finite list of odd primes \( q_1, \dots, q_m \), one can construct \( M = 2 \cdot q_1 \cdots q_m - 1 \), which is odd and greater than 1, ensuring an odd prime factor not in the list.

Euclid's proof laid the foundational cornerstone of number theory, inspiring centuries of research into the distribution and properties of primes and demonstrating the power of deductive reasoning in mathematics. Its geometric presentation in the *Elements* reflects the era's emphasis on visual and spatial arguments, yet it remains a model of logical clarity more than two millennia later.

A common misconception about the proof is that it provides a method to construct or enumerate all primes sequentially; in reality, it only shows that any finite list can be extended by at least one more prime, without specifying how to find it. Another frequent error is assuming \( N \) itself is always prime, whereas the proof requires only that it has a new prime divisor, which may divide a proper factor of \( N \).

### Prime-Generating Formulas

One notable early attempt at a prime-generating formula is the quadratic polynomial \(n^2 + n + 41\), discovered by Leonhard Euler in 1772. This expression yields prime numbers for \(n = 0, 1, \dots, 39\), producing 40 consecutive primes, but it fails for \(n = 40\), where the value 41^2 = 1681 = 41 \	imes 41 is composite. Despite its impressive streak, the polynomial generates composites for larger \(n\), illustrating the challenges in constructing formulas that produce only primes indefinitely.

In 1947, W. H. Mills introduced a prime-representing function based on analytic number theory results about prime gaps. Specifically, Mills proved the existence of a constant \(\	heta \u003e 1\) such that \(A(n) = \lfloor \	heta^{3^n} \rfloor\) is prime for every positive integer \(n\). The value \(\	heta \approx 1.3063778838630806904686144926\) (known as Mills' constant) was later computed numerically to ensure the formula works for small \(n\), but the constant is not explicitly derived and relies on empirical verification for practical use. This formula generates an infinite sequence of primes but is not constructive in a simple algebraic sense, as the choice of \(\	heta\) depends on deep results like those of Ingham on prime distributions.

Another explicit but highly inefficient formula for the \(n\)th prime \(p_n\) was given by C. P. Willans in 1964. Willans' formula is

\[
p_n = 1 + \sum_{i=1}^{2^n} \left\lfloor \left( \frac{n}{\sum_{j=1}^i \left\lfloor \left( \cos \frac{(j-1)! + 1}{j} \pi \right)^2 \right\rfloor} \right)^{1/n} \right\rfloor,
\]

which uses Wilson's theorem to count primes up to a bound and isolates \(p_n\) through summation and floor functions. Although it correctly produces the \(n\)th prime for any positive integer \(n\), the computational complexity grows exponentially, making it impractical for large \(n\).

Despite these efforts, fundamental limitations exist for polynomial-based prime generators. In 1951, Ivan Niven proved that no non-constant polynomial with integer coefficients can produce prime values for all sufficiently large positive integers \(n\), as such polynomials will inevitably take composite values infinitely often due to their modular arithmetic properties. This result aligns with broader undecidability insights from Yuri Matiyasevich's 1970 resolution of Hilbert's tenth problem, which implies that no simple single-variable polynomial can enumerate exactly the primes without also producing composites or missing some primes.

### Unsolved Elementary Problems

One of the most famous unsolved problems in number theory is the Goldbach conjecture, proposed by Christian Goldbach in a 1742 letter to Leonhard Euler, which states that every even integer greater than 2 can be expressed as the sum of two prime numbers. Despite extensive efforts, the conjecture remains unproven, though it has been empirically verified for all even integers up to 4 × 10¹⁸ through computational methods. A significant partial result is Chen's theorem from 1966, which proves that every sufficiently large even integer is the sum of a prime and a number with at most two prime factors.

The twin prime conjecture, a special case of Polignac's conjecture proposed by Alphonse de Polignac in 1849, posits that there are infinitely many pairs of primes differing by 2. This remains open as of 2025, with no full proof established. Major progress came in 2013 when Yitang Zhang demonstrated that there are infinitely many pairs of primes differing by at most 70 million, providing the first bounded gap result. Subsequent work by the Polymath project reduced this bound to 246, but the exact difference of 2 for infinitely many pairs is still unresolved.

Polignac's conjecture generalizes the twin prime case, asserting that for every positive even integer 2k, there are infinitely many prime pairs (p, p + 2k). Like its special cases, it lacks a proof in 2025, though bounded gap results apply to small fixed differences, and computational searches have identified numerous such pairs for various k up to large values. These elementary conjectures continue to inspire research, with partial theorems like Chen's offering insights into prime distributions without resolving the infinitude questions.

## Analytic Properties

### Advanced Proofs of Infinitude

One of the earliest analytic proofs of the infinitude of prime numbers was provided by Leonhard Euler in 1737, building on the elementary geometric argument attributed to Euclid around 300 BCE. While Euclid's proof relies on constructing a number larger than any finite set of primes to yield a new prime factor, Euler's approach uses infinite series and products to demonstrate that the primes cannot be finite in number. This method marks the inception of analytic number theory and leverages the divergence of the harmonic series to infer the unbounded nature of the primes.

Euler introduced the Riemann zeta function, defined for real numbers \(s \u003e 1\) as the infinite sum
\[
\zeta(s) = \sum_{n=1}^\infty \frac{1}{n^s}.
\]
This series converges for \(s \u003e 1\) but diverges as \(s \	o 1^+\), mirroring the behavior of the harmonic series \(\sum_{n=1}^\infty \frac{1}{n}\), which grows like \(\ln N + \gamma\) (where \(\gamma\) is the Euler-Mascheroni constant) and thus tends to infinity. Euler established that this sum equals an infinite product over all primes \(p\):
\[
\zeta(s) = \prod_p \frac{1}{1 - p^{-s}},
\]
where the product converges absolutely for \(s \u003e 1\) due to the unique factorization of integers into primes. The equality holds because expanding each geometric series factor \(\frac{1}{1 - p^{-s}} = \sum_{k=0}^\infty p^{-ks}\) and multiplying over primes generates all positive integers exactly once in the denominator.

To prove the infinitude of primes, consider the limit as \(s \	o 1^+\). The left side \(\zeta(s)\) diverges to infinity, as it approaches the divergent harmonic series. If there were only finitely many primes, say \(p_1, \dots, p_m\), the right side would reduce to a finite product \(\prod_{i=1}^m \frac{1}{1 - p_i^{-s}}\), which converges to a finite nonzero value even at \(s=1\). This contradiction implies there must be infinitely many primes. For a more quantitative insight, take the natural logarithm of the product:
\[
\log \zeta(s) = -\sum_p \log(1 - p^{-s}).
\]
Using the Taylor expansion \(\log(1 - x) = -\sum_{k=1}^\infty \frac{x^k}{k}\) for \(|x| \u003c 1\), the leading term yields
\[
\log \zeta(s) \sim \sum_p p^{-s}
\]
as higher powers \(p^{-ks}\) for \(k \geq 2\) become negligible near \(s=1\). Since \(\zeta(s) \sim \frac{1}{s-1}\) near \(s=1\) (from the integral representation or partial summation), \(\log \zeta(s) \sim -\log(s-1) \	o \infty\). Thus, \(\sum_p p^{-1}\) diverges, confirming infinitely many primes and providing a stronger result than mere infinitude, as the sum's growth rate relates to prime density.

This analytic confirmation via sums and products contrasts with Euclid's constructive method by embedding the primes within the global structure of the natural numbers through convergence properties, paving the way for deeper connections in number theory. Euler's argument, though informal in its original presentation, was later rigorized using Weierstrass products for entire functions.

### Prime Counting Function

The prime counting function, denoted \(\pi(x)\), counts the number of prime numbers less than or equal to a positive real number \(x\). It is a step function that increases by 1 at each prime and remains constant in between.

The Prime Number Theorem provides the asymptotic behavior of \(\pi(x)\), stating that \(\pi(x) \sim \frac{x}{\log x}\) as \(x \	o \infty\). This result, which quantifies the density of primes among the positive integers, was proved independently in 1896 by Jacques Hadamard and Charles Jean de la Vallée Poussin. Their proofs established that the theorem follows from the non-vanishing of the Riemann zeta function \(\zeta(s)\) on the line \(\operatorname{Re}(s) = 1\). Specifically, Hadamard and de la Vallée Poussin showed that \(\zeta(s) \
eq 0\) for \(\operatorname{Re}(s) = 1\) using properties of the zeta function's analytic continuation and growth estimates, which imply bounds on the Chebyshev functions and, via Tauberian theorems, the desired asymptotic for \(\pi(x)\).

A more precise approximation to \(\pi(x)\) is given by the offset logarithmic integral, defined as
\[
\operatorname{li}(x) = \int_2^x \frac{dt}{\log t}.
\]
The Prime Number Theorem implies \(\pi(x) \sim \operatorname{li}(x)\) as \(x \	o \infty\), and this integral outperforms the simpler \(\frac{x}{\log x}\) in capturing the distribution of primes.

Refinements to the error term in the Prime Number Theorem have been pursued since the original proofs. In 1936, Harald Cramér established an improved bound of the form \(\pi(x) = \operatorname{li}(x) + O\left(x \exp\left(-c \sqrt{\log x}\right)\right)\) for some constant \(c \u003e 0\). Recent computational and analytic work in the 2020s has further tightened explicit versions of such bounds, verifying them for extremely large \(x\) through high-precision calculations of \(\pi(x)\) and \(\operatorname{li}(x)\).

### Primes in Arithmetic Progressions

In 1837, Peter Gustav Lejeune Dirichlet proved that if two positive integers \(a\) and \(d\) are coprime, then there are infinitely many prime numbers congruent to \(a\) modulo \(d\). This result generalizes Euclid's ancient proof of the infinitude of primes by showing that primes are infinite not only overall but also within specific arithmetic progressions where the common difference \(d\) and the residue \(a\) share no common factors.

The proof relies on analytic methods involving Dirichlet L-functions, defined for a Dirichlet character \(\chi\) modulo \(d\) as \(L(s, \chi) = \sum_{n=1}^\infty \frac{\chi(n)}{n^s}\) for \(\operatorname{Re}(s) \u003e 1\), which admit Euler product representations \(L(s, \chi) = \prod_p (1 - \chi(p) p^{-s})^{-1}\). By orthogonality of characters, the sum over primes \(p \equiv a \pmod{d}\) of \(p^{-s}\) can be expressed in terms of these L-functions. Dirichlet showed that the principal L-function corresponds to the Riemann zeta function \(\zeta(s)\), which has a pole at \(s=1\), while the non-principal L-functions extend holomorphically to \(\operatorname{Re}(s) \u003e 0\) and satisfy \(L(1, \chi) \
eq 0\) for all non-principal \(\chi\). This non-vanishing implies the logarithmic divergence of the relevant prime sum as \(s \	o 1^+\), establishing the infinitude of such primes.

Under the prime number theorem for arithmetic progressions, the primes congruent to \(a\) modulo \(d\) have asymptotic density \(\frac{1}{\phi(d)}\) among all primes, where \(\phi\) is Euler's totient function counting integers up to \(d\) coprime to \(d\). For example, the primes congruent to 1 modulo 4 and those congruent to 3 modulo 4 each constitute half of all primes asymptotically, illustrating the equitable distribution across coprime residue classes.

A key generalization is Linnik's theorem, which addresses the location of the smallest prime in such a progression. It states that for coprime \(a\) and \(d\), the least prime \(p \equiv a \pmod{d}\) satisfies \(p \ll d^L\) for some absolute constant \(L \u003e 0\). Originally proved in 1944 with a large \(L\), modern refinements have reduced \(L\) to 5. This bound quantifies how quickly primes appear in the progression, with implications for zero-free regions of L-functions.

### Primes from Quadratic Polynomials

One notable example of a quadratic polynomial that generates many prime numbers is Euler's polynomial \(n^2 + n + 41\), which produces prime values for all integers \(n\) from 0 to 39, yielding 40 consecutive primes. This polynomial, discovered by Leonhard Euler in 1772, remains the quadratic that generates the longest known sequence of primes for consecutive nonnegative integers, though it fails to produce primes beyond this range, such as at \(n=40\) where the value is composite (41 × 41).

The Bunyakovsky conjecture, proposed by Viktor Bunyakovsky in 1857, posits that an irreducible polynomial \(f(n)\) of degree greater than or equal to 1 with integer coefficients, positive leading coefficient, and such that the greatest common divisor of all its values \(f(1), f(2), \dots\) is 1, takes prime values for infinitely many positive integers \(n\). For quadratic polynomials satisfying these conditions—irreducibility over the integers, positive leading coefficient, and no fixed prime divisor across all values—the conjecture specifically predicts infinitely many primes. Bunyakovsky's original formulation focused on quadratic forms but extends naturally to higher degrees, generalizing Dirichlet's theorem on primes in arithmetic progressions (which holds for linear polynomials of degree 1).

No general proof exists for the Bunyakovsky conjecture when the degree exceeds 1, including for quadratics, though partial results provide asymptotic bounds under additional assumptions. A key limitation arises from the possible existence of Siegel zeros—real zeros close to 1 in Dirichlet L-functions—which obstruct effective error terms in the prime number theorem for polynomials, preventing unconditional proofs of infinitude even for specific quadratics. For instance, assuming the nonexistence of Siegel zeros (or the generalized Riemann hypothesis) allows for positive lower bounds on the number of primes generated by such quadratics up to \(x\), but these remain conditional.

A prominent open case is the infinitude of primes of the form \(n^2 + 1\), where the polynomial satisfies Bunyakovsky's conditions but no proof exists despite numerical evidence of infinitely many such primes. This problem, dating back to Euler's considerations in 1752, illustrates the rarity of such primes compared to linear forms, as their density is heuristically about \(\sqrt{x}/\log x\) up to \(x\), yet remains unproven.

Analytic progress toward the conjecture for quadratics relies on the Hardy-Littlewood circle method, which yields conjectural asymptotic formulas for the count of primes generated by \(f(n)\) up to \(x\). The Bateman-Horn conjecture, building on this method, predicts that the number of \(n \leq x\) for which an irreducible quadratic \(f(n)\) is prime is asymptotically \(C \frac{x}{\log x}\), where \(C\) is a positive constant depending on \(f\) via a product over primes involving the local densities of prime values. This heuristic, derived from singular series in the circle method, aligns with Euler's polynomial producing roughly the expected number of primes in its initial streak and supports infinitude under the conjecture's assumptions.

### Riemann Zeta Function and Hypothesis

The Riemann zeta function \(\zeta(s)\) is initially defined for complex numbers \(s\) with real part \(\operatorname{Re}(s) \u003e 1\) by the infinite series
\[
\zeta(s) = \sum_{n=1}^\infty \frac{1}{n^s}.
\]
This representation converges absolutely in that half-plane and admits an Euler product expansion
\[
\zeta(s) = \prod_p \left(1 - p^{-s}\right)^{-1},
\]
where the product runs over all prime numbers \(p\). The Euler product highlights the intimate connection between the zeta function and the primes, as it encodes the fundamental theorem of arithmetic. The function admits a meromorphic continuation to the entire complex plane, with a single simple pole at \(s=1\) and no other singularities.

In his seminal 1859 paper "On the Number of Primes Less Than a Given Magnitude," Bernhard Riemann introduced an analytic continuation of \(\zeta(s)\) and conjectured that all non-trivial zeros—those not at negative even integers—lie on the critical line \(\operatorname{Re}(s) = 1/2\). This statement, known as the Riemann hypothesis, posits that if \(\zeta(\rho) = 0\) for a non-trivial zero \(\rho\), then \(\operatorname{Re}(\rho) = 1/2\). The hypothesis remains one of the Clay Mathematics Institute's Millennium Prize Problems, underscoring its centrality to number theory. The prime number theorem, which describes the asymptotic density of primes, follows from non-vanishing of \(\zeta(s)\) on \(\operatorname{Re}(s)=1\), but the hypothesis refines this further.

The Riemann hypothesis carries significant implications for prime distribution, particularly sharpening the error term in the prime number theorem. Assuming the hypothesis, the prime-counting function satisfies \(\pi(x) = \operatorname{li}(x) + O(\sqrt{x} \log x)\), where \(\operatorname{li}(x)\) is the logarithmic integral; this bound, established by von Koch in 1901, is the strongest known conditional result and reflects the hypothesis's power in controlling oscillations from the zeros. A explicit link between the zeros and primes appears in von Mangoldt's formula for the Chebyshev function \(\psi(x) = \sum_{n \leq x} \Lambda(n)\), where \(\Lambda\) is the von Mangoldt function:
\[
\psi(x) = x - \sum_\rho \frac{x^\rho}{\rho} - \log(2\pi) - \frac{1}{2} \log\left(1 - \frac{1}{x^2}\right),
\]
with the sum over all non-trivial zeros \(\rho\). This formula reveals how deviations of \(\psi(x)\) from \(x\) are governed by the zeros, providing a direct analytic bridge to prime powers.

As of 2025, the Riemann hypothesis remains unproven despite extensive efforts. Computational checks have verified that the first \(10^{13}\) non-trivial zeros lie on the critical line, supporting the conjecture empirically up to immense heights. Recent theoretical advances include refined zero-free regions, such as the 2024 result establishing no zeros in \(\sigma \geq 1 - \frac{1}{57.54 (\log |t|)^{2/3} (\log \log |t|)^{1/3}}\) for \(|t| \geq 3\), and improvements to Korobov-Vinogradov-type bounds, enhancing understanding of the zeta function's behavior near the critical line.

## Algebraic Structures

### Modular Arithmetic and Finite Fields

Modular arithmetic, the study of integers modulo a fixed integer \(n\), reveals profound connections to prime numbers when \(n = p\) is prime. In this case, the ring \(\mathbb{Z}/p\mathbb{Z}\) of residue classes modulo \(p\) forms a field, denoted \(\mathrm{GF}(p)\), where every nonzero element has a multiplicative inverse. This structure arises because \(p\) being prime ensures that no nonzero residue is a zero divisor, allowing division (except by zero) within the system. The characteristic of \(\mathrm{GF}(p)\) is precisely \(p\), the smallest positive integer such that \(p \cdot 1 = 0\) in the field, and this prime order underpins the field's finite nature with exactly \(p\) elements./22:_Finite_Fields/22.01:_Structure_of_a_Finite_Field)

A cornerstone property in this setting is Fermat's Little Theorem, which states that if \(p\) is prime and \(a\) is an integer not divisible by \(p\), then \(a^{p-1} \equiv 1 \pmod{p}\). This theorem, first stated by Pierre de Fermat in 1640 and proved by Leonhard Euler in 1736, highlights the cyclic multiplicative group of \(\mathbb{Z}/p\mathbb{Z}^\	imes\), which has order \(p-1\). An equivalent form, often called Fermat-Euler's theorem, extends to all integers \(a\): \(a^p \equiv a \pmod{p}\), holding even when \(p\) divides \(a\) since both sides are \(0 \pmod{p}\). These congruences exploit the field's properties to simplify exponentiations and demonstrate the theorem's utility in algebraic manipulations over finite fields.

Wilson's Theorem provides another characterization: for a prime \(p\), \((p-1)! \equiv -1 \pmod{p}\). Proposed by John Wilson in the 18th century and proved by Joseph-Louis Lagrange in 1773, it follows from pairing inverses in the multiplicative group \(\mathbb{Z}/p\mathbb{Z}^\	imes\), leaving \(1\) and \(p-1 \equiv -1\) unpaired. This factorial congruence uniquely identifies primes among integers greater than 1, as the converse also holds.

These theorems underpin basic primality tests in modular arithmetic. For instance, checking if \(a^{p-1} \equiv 1 \pmod{p}\) for bases \(a\) coprime to \(p\) can indicate primality via Fermat's Little Theorem, though composites may pseudoprime for specific \(a\). Similarly, verifying \((p-1)! \equiv -1 \pmod{p}\) directly tests the condition from Wilson's Theorem, offering a deterministic but computationally intensive check for small \(p\). Such applications leverage the algebraic structure of finite fields without delving into probabilistic or advanced sieving methods./01:_Chapters/1.25:_Primality_Tests)

### p-adic Numbers

The p-adic numbers arise in number theory as a completion of the rational numbers \(\mathbb{Q}\) with respect to a metric defined using a prime \(p\), providing a framework where primes play a central role in the topology and algebraic structure. For a fixed prime \(p\), the p-adic valuation \(v_p(n)\) of a nonzero integer \(n\) is defined as the highest power of \(p\) that divides \(n\), i.e., \(v_p(n) = k\) where \(p^k\) divides \(n\) but \(p^{k+1}\) does not, and \(v_p(0) = +\infty\). This valuation extends multiplicatively to the rationals: for \(x = p^k \cdot \frac{a}{b}\) with \(a, b\) integers not divisible by \(p\), \(v_p(x) = k\).

The associated p-adic absolute value is then given by \(|x|_p = p^{-v_p(x)}\) for \(x \
eq 0\), and \(|0|_p = 0\), inducing a non-Archimedean metric on \(\mathbb{Q}\) where distances emphasize divisibility by powers of \(p\). The p-adic numbers \(\mathbb{Q}_p\) are the completion of \(\mathbb{Q}\) under this metric, while the p-adic integers \(\mathbb{Z}_p\) consist of those elements with \(|x|_p \leq 1\). One standard construction of \(\mathbb{Z}_p\) views its elements as formal power series \(\sum_{k=0}^\infty a_k p^k\), where each \(a_k\) is an integer satisfying \(0 \leq a_k \u003c p\). Addition and multiplication are defined componentwise with carry-over, analogous to base-\(p\) expansions but extending infinitely to the left.

In the ring \(\mathbb{Z}_p\), which is an integral domain with no zero divisors, the prime \(p\) generates the unique maximal ideal \((p)\), making \(\mathbb{Z}_p\) a discrete valuation ring where every nonzero element factors uniquely into units and powers of \(p\). Elements with \(v_p(x) = 0\) are units, while those with \(v_p(x) \u003e 0\) are non-units divisible by \(p\), and there are no other prime elements beyond associates of \(p\). This structure highlights the primacy of the fixed prime \(p\) in the p-adic setting, contrasting with the integers where multiple primes exist.

A key tool connecting modular arithmetic modulo \(p\) to the p-adics is Hensel's lemma, which allows lifting solutions of polynomial equations from \(\mathbb{Z}/p\mathbb{Z}\) to solutions in \(\mathbb{Z}_p\) under suitable conditions. Specifically, if \(f(x) \in \mathbb{Z}_p[x]\) satisfies \(f(a) \equiv 0 \pmod{p}\) and \(f'(a) \
ot\equiv 0 \pmod{p}\) for some \(a \in \mathbb{Z}_p\), then there exists a unique \(b \in \mathbb{Z}_p\) such that \(f(b) = 0\) and \(b \equiv a \pmod{p}\). More generally, if \(f'(a) \equiv 0 \pmod{p}\) but \(f(a) \equiv 0 \pmod{p^2}\), lifting is still possible with multiplicity. This lemma, originally due to Kurt Hensel in 1897, facilitates solving Diophantine equations p-adically by iteratively refining modular solutions.

### Prime Elements in Rings

In a commutative ring \(R\) with identity, a prime element is defined as a nonzero, non-unit element \(\pi \in R\) such that whenever \(\pi\) divides a product \(ab\) for \(a, b \in R\), then \(\pi\) divides \(a\) or \(\pi\) divides \(b\). This generalizes the notion of prime numbers from the integers \(\mathbb{Z}\) to broader algebraic structures, where the divisibility condition captures the "prime-like" behavior of not factoring non-trivially without dividing one of the factors.

Examples of prime elements abound in specific rings. In the ring of integers \(\mathbb{Z}\), the prime elements are precisely the usual prime numbers (up to units \(\pm 1\)). In the Gaussian integers \(\mathbb{Z}[i] = \{a + bi \mid a, b \in \mathbb{Z}\}\), prime elements include \(1 + i\) (with norm 2), ordinary primes \(p \equiv 3 \pmod{4}\) that remain prime, and factors of primes \(p \equiv 1 \pmod{4}\) such as \(2 + i\) and \(2 - i\) (norm 5). These Gaussian primes illustrate how prime elements can arise in quadratic integer rings beyond \(\mathbb{Z}\), enabling unique factorization up to units.

Prime elements are always irreducible, meaning they cannot be expressed as a product of two non-unit elements. However, the converse holds only in certain domains: in a unique factorization domain (UFD), every irreducible element is prime, allowing factorization into irreducibles (equivalently, primes) to be unique up to units and order. For instance, the ring \(\mathbb{Z}\) is a UFD where this equivalence applies, as established by the fundamental theorem of arithmetic. Moreover, if \(\pi\) is a prime element in an integral domain, the principal ideal \((\pi)\) it generates is a prime ideal, linking element-level primality to ideal structure without requiring full ideal theory.

Principal ideal domains (PIDs) provide a key distinction, as every PID is a UFD, ensuring that prime elements coincide with irreducibles and every nonzero prime ideal is principal, generated by a prime element. In contrast, not all UFDs are PIDs—for example, the polynomial ring \(\mathbb{Z}[x]\) is a UFD but not a PID, since the ideal \((2, x)\) is not principal—yet both retain the prime-irreducible equivalence. This structure highlights how primality in rings extends the integer case while introducing nuances in factorization properties.

### Prime Ideals

In ring theory, a prime ideal of a commutative ring \(R\) with identity is a proper ideal \(P \
eq R\) such that whenever the product \(ab \in P\) for elements \(a, b \in R\), then either \(a \in P\) or \(b \in P\). This property generalizes the notion of primality from integers to ideals, capturing a form of "irreducibility" in the multiplicative structure of the ring. An equivalent characterization is that \(P\) is prime if and only if the quotient ring \(R/P\) is an integral domain, meaning it has no zero divisors.

In the specific case of the ring of integers \(\mathbb{Z}\), the prime ideals are precisely the zero ideal \((0)\) and the principal ideals \((p)\) generated by prime numbers \(p\). Here, \((0)\) corresponds to the generic prime in the spectrum, while \((p)\) reflects the usual primes, with \(\mathbb{Z}/(p) \cong \mathbb{Z}/p\mathbb{Z}\) being a field, hence an integral domain. Prime elements in integral domains like \(\mathbb{Z}\) generate principal prime ideals.

The set of all prime ideals of \(R\), denoted \(\operatorname{Spec}(R)\), forms the prime spectrum of the ring, equipped with the Zariski topology where closed sets are of the form \(V(I) = \{\mathfrak{p} \in \operatorname{Spec}(R) \mid I \subseteq \mathfrak{p}\}\) for ideals \(I \subseteq R\). This topological space encodes the structure of \(R\) and serves as the foundation for schemes in algebraic geometry. Hilbert's Nullstellensatz links \(\operatorname{Spec}(R)\) to algebraic varieties over algebraically closed fields, stating that for an ideal \(I\) in \(k[x_1, \dots, x_n]\) with \(k\) algebraically closed, the radical \(\sqrt{I}\) consists of all polynomials vanishing on the variety \(V(I)\), establishing a bijection between radical ideals and affine varieties.

### Primes in Group Theory

In group theory, prime numbers are central to analyzing the structure of finite groups, especially through theorems that link the prime factors of a group's order to the existence of specific subgroups and elements. These results reveal how primes dictate the presence of cyclic components and constrain overall group properties, often leveraging the fact that orders modulo a prime influence subgroup indices.

A foundational result is Cauchy's theorem, which states that if a prime \( p \) divides the order \( |G| \) of a finite group \( G \), then \( G \) contains an element of order \( p \). Equivalently, \( G \) has a cyclic subgroup of order \( p \). This theorem, originally established by Augustin-Louis Cauchy, provides a partial converse to Lagrange's theorem by guaranteeing elements whose orders match prime divisors of \( |G| \).

The Sylow theorems generalize Cauchy's result to powers of primes, offering powerful tools for decomposing groups. For a finite group \( G \) with \( |G| = p^k m \) where \( p \) is prime and \( p \) does not divide \( m \), a Sylow \( p \)-subgroup of \( G \) is a subgroup of order \( p^k \). The first Sylow theorem asserts that such subgroups exist and that every \( p \)-subgroup is contained in some Sylow \( p \)-subgroup. The second theorem states that all Sylow \( p \)-subgroups are conjugate in \( G \). The third theorem specifies that the number \( n_p \) of distinct Sylow \( p \)-subgroups satisfies

\[
n_p \equiv 1 \pmod{p}
\]

and \( n_p \) divides \( m = |G|/p^k \). These theorems, due to Peter Ludvig Sylow in 1872, enable detailed classification of groups by controlling the distribution of prime-power subgroups.

Prime orders yield particularly simple structures. Every group of prime order \( p \) is cyclic, isomorphic to the additive group \( \mathbb{Z}/p\mathbb{Z} \), with \( p-1 \) generators (all non-identity elements). Such groups are also simple, as their only subgroups are the trivial subgroup and the group itself, with no nontrivial normal subgroups. Cyclic groups of prime order exemplify abelian simple groups, and they appear as building blocks in the classification of finite simple groups.

Burnside's \( p^a q^b \)-theorem further illustrates primes' role in solvability: if \( |G| = p^a q^b \) for distinct primes \( p \) and \( q \), then \( G \) is solvable. This 1904 result by William Burnside shows that groups with orders involving only two distinct primes cannot be nonsolvable simple groups (except for prime order itself), relying on Sylow analysis to construct solvable series.

## Computational Methods

### Trial Division

Trial division is a fundamental algorithm for determining the primality of a positive integer \( n \u003e 1 \) or for finding its prime factors by systematically testing potential divisors. The method relies on the basic property that if \( n \) is composite, it must have a divisor \( d \) satisfying \( 1 \u003c d \leq \sqrt{n} \). Thus, it suffices to check divisibility only up to \( \lfloor \sqrt{n} \rfloor \), as any larger divisor would pair with a smaller one already examined.

The algorithm proceeds as follows: First, if \( n = 2 \), it is prime; if \( n \) is even and greater than 2, it is composite. For odd \( n \u003e 2 \), check divisibility by 2 separately to handle the even case efficiently. Then, test successive odd integers \( d = 3, 5, 7, \dots \) up to \( \lfloor \sqrt{n} \rfloor \). If any such \( d \) divides \( n \) (i.e., \( n \mod d = 0 \)), then \( n \) is composite, and \( d \) is a factor. If no such \( d \) is found, \( n \) is prime. This optimization reduces the number of trials by approximately half compared to checking all integers from 2 onward.

Formally, \( n \) is composite if there exists an integer \( d \) such that \( 1 \u003c d \u003c n \) and \( d \mid n \); otherwise, for \( n \u003e 1 \), it is prime. In pseudocode, the optimized trial division for primality can be expressed as:

```
function is_prime(n):
    if n ≤ 1: return false
    if n = 2: return true
    if n even: return false
    for d = 3 to sqrt(n) step 2:
        if n mod d = 0: return false
    return true
```

This implementation confirms primality deterministically for small to moderate \( n \).

The worst-case time complexity of trial division is \( O(\sqrt{n}) \), occurring when \( n \) is prime, as all potential divisors up to \( \sqrt{n} \) must be tested. This makes it efficient for small \( n \) but impractical for large numbers, where more advanced methods are required.

Historically, trial division has served as the basis for early primality tests and factorizations since antiquity, with roots in ancient Greek mathematics. It was employed by mathematicians like Leonhard Euler in the 18th century to verify large primes, such as confirming the primality of \( 2^{31} - 1 \) in 1772 through exhaustive division. The method's simplicity made it a cornerstone for compiling early tables of primes before the development of sieving techniques.

### Sieving Algorithms

Sieving algorithms are efficient methods for generating lists of prime numbers up to a specified limit \(n\), by systematically eliminating composite numbers from a sequence of candidates. The foundational approach, known as the sieve of Eratosthenes, dates to the third century BCE and remains a cornerstone for prime enumeration due to its simplicity and practicality.

The sieve of Eratosthenes operates by initializing an array of boolean values representing integers from 2 to \(n\), initially assuming all are prime. Starting with the first prime 2, multiples of each prime \(p\) (beginning from \(p^2\)) are marked as composite up to \(n\), with the process continuing for each unmarked number up to \(\sqrt{n}\). This ensures all composites are identified as multiples of smaller primes, leaving unmarked entries as primes. The algorithm requires \(O(n \log \log n)\) operations and \(O(n)\) space, making it suitable for moderate \(n\).

Formally, for a limit \(n\), an array of size \(n+1\) is created, and for each prime \(p \leq \sqrt{n}\), multiples \(k \cdot p\) (where \(k \geq p\)) are marked as non-prime:

\[
\	ext{For } p = 2 \	ext{ to } \sqrt{n}, \quad \	ext{mark } k \cdot p \	ext{ as composite for } k = p, p+1, \dots, \lfloor n/p \rfloor.
\]

This step-by-step elimination leverages the fundamental theorem of arithmetic, as every composite has a prime factor at most its square root.

A significant advancement is the sieve of Atkin, introduced in 2004, which improves efficiency through wheel factorization—skipping multiples of small primes like 2 and 3—and sieving based on quadratic forms modulo 60. Unlike Eratosthenes' linear marking, it identifies primes by toggling array entries according to solutions of equations like \(4x^2 + y^2 \equiv 1 \pmod{60}\), followed by corrections for small primes. This yields a time complexity of \(O(n / \log \log n)\), asymptotically superior for large \(n\), though practical implementations may require optimizations to outperform Eratosthenes for smaller ranges.

For very large \(n\) where memory constraints arise, modern variants like the segmented sieve divide the range into smaller segments of size \(\sqrt{n}\) or less, applying the Eratosthenes method segment-by-segment while precomputing small primes up to \(\sqrt{n}\). This reduces space to \(O(\sqrt{n})\) while maintaining near-linear time, enabling generation of primes up to \(10^{18}\) or beyond on standard hardware. Recent implementations incorporate multithreading and cache-aware processing for further speedup in distributed computing environments.

These sieving methods excel at batch prime generation compared to per-number checks like trial division, which is less efficient for exhaustive lists up to \(n\).

### Primality Testing

Primality testing involves algorithms designed to determine whether a given positive integer \(n \u003e 1\) is prime, offering efficient alternatives to exhaustive trial division for large \(n\). These tests typically provide probabilistic assurances of primality or, in some cases, deterministic verification within practical bounds, without requiring full factorization of \(n\). The focus here is on prominent methods that balance speed and reliability for cryptographic and computational applications.

The Miller-Rabin primality test stands as the most widely adopted probabilistic method for primality testing. Developed initially by Gary L. Miller in 1976 as a deterministic test conditional on the generalized Riemann hypothesis, it was rendered unconditionally probabilistic by Michael O. Rabin in 1980. The test builds on Fermat's Little Theorem by employing a stronger notion of pseudoprimality to reduce the chance of misidentifying composites as primes. To apply the test, first express \(n-1 = 2^s \cdot d\) where \(d\) is odd and \(s \geq 1\). Select a random base \(a\) with \(2 \leq a \leq n-2\) and gcd\((a, n) = 1\). Compute \(x_0 = a^d \mod n\).

If \(x_0 \equiv 1 \pmod{n}\) or \(x_0 \equiv -1 \pmod{n}\), then \(n\) is a probable prime to base \(a\). Otherwise, for \(r = 1\) to \(s-1\), set \(x_r = x_{r-1}^2 \mod n\); if \(x_r \equiv -1 \pmod{n}\) for some \(r\), then \(n\) is a probable prime to base \(a\). If none of these conditions hold, \(n\) is composite. The procedure can be formalized as checking whether \(a^{n-1} \equiv 1 \pmod{n}\) holds in a specific "strong" form that avoids the pitfalls of Carmichael numbers, which fool weaker Fermat-based tests.

For a composite \(n\), the probability that a randomly chosen \(a\) declares \(n\) probable prime is at most \(1/4\), independent of \(n\)'s size. Thus, performing \(t\) independent trials with distinct random bases reduces the error probability to less than \(4^{-t}\), making the test highly reliable in practice even with modest \(t\) (e.g., \(t = 10\) yields error below \(10^{-6}\)). This bound ensures that composites are detected with overwhelming probability, and the test's runtime is \(O(t \cdot k \log^3 n)\) using fast exponentiation, where \(k = \log n\) is the bit length.

Deterministic variants of the Miller-Rabin test eliminate randomness by fixing a small set of bases (witnesses) that guarantee correctness for numbers below specified bounds, verified through exhaustive computational searches for strong pseudoprimes. For example, testing bases 2, 7, and 61 suffices deterministically for all \(n \u003c 4,759,123,141\). For larger ranges, extended sets provide certainty; notably, for \(n \u003c 3,317,044,064,679,887,385,961,981\) (exceeding \(2^{64}\)), the bases 2, 3, 5, 7, 11, 13, 23 are sufficient to determine primality exactly. Such sets enable fast, deterministic testing for 64-bit numbers in applications like cryptography, where \(n \u003c 2^{64}\) is common.

In contrast to these practical approaches, the Agrawal-Kayal-Saxena (AKS) test provides the first unconditional deterministic polynomial-time algorithm for primality, announced in 2002 and published in 2004. The AKS algorithm verifies primality by checking whether \(n\) satisfies a set of congruences in the ring \(\mathbb{Z}/n\mathbb{Z}[x]\), specifically testing if \((x + a)^n \equiv x^n + a \pmod{n}\) for several small \(a\), after selecting a parameter \(r\) such that the order of \(n\) modulo \(r\) exceeds \(\log^2 n\). Its original runtime is \(O(\log^{6} n)\), improved to \(O(\log^{4.5} n)\) in subsequent work, but the test remains slower than Miller-Rabin for numbers up to thousands of digits due to higher constants. Despite its theoretical milestone—proving that primality is in P—AKS is rarely used in practice outside educational contexts.

### Primality Proving

Primality proving involves constructing explicit certificates or deterministic algorithms that rigorously verify a number is prime, providing irrefutable evidence unlike probabilistic primality tests, which offer high confidence but require additional steps for certainty. These methods are essential for applications demanding absolute assurance, such as cryptography and number theory research, though general deterministic proofs can be computationally intensive, often requiring exponential time in the worst case without specialized structures.

One foundational approach is the Pratt certificate, introduced in 1975, which demonstrates that PRIMES is in NP by providing a succinct, verifiable proof for any prime \( p \). The certificate consists of a primitive root \( g \) modulo \( p \), the complete prime factorization of \( p-1 = q_1^{e_1} \cdots q_k^{e_k} \), recursive Pratt certificates for each distinct prime factor \( q_i \), and verification that \( g^{p-1} \equiv 1 \pmod{p} \) and \( g^{(p-1)/q_i} \
ot\equiv 1 \pmod{p} \) for each \( i \). This recursive structure leverages Fermat's Little Theorem and the properties of primitive roots, ensuring the certificate can be checked in polynomial time relative to the input size, with the total size being \( O(\log^2 p) \).

The Elliptic Curve Primality Proving (ECPP) method, developed in the 1980s and refined in 1993, uses elliptic curves over finite fields to generate probabilistic certificates that can be converted to deterministic proofs. For a candidate prime \( p \), an elliptic curve \( E \) over \( \mathbb{F}_p \) is constructed such that it has a point \( P \) of prime order \( Q \), where \( Q \) divides \( p-1 \) or a related parameter, and a chain of subsequent curves is built to reduce the problem recursively until reaching a small proven prime. The primality follows from the fact that if \( p \) were composite, the group order would contradict the Hasse-Weil bound or the point's order; the full certificate includes the curve parameters, point coordinates, and recursive sub-certificates, verifiable in subexponential time. This approach has proven practical for numbers up to thousands of digits.

For Mersenne numbers of the form \( M_p = 2^p - 1 \) where \( p \) is prime, the Lucas-Lehmer test offers a specialized, efficient proof dating back to 1878 with improvements in the 1930s. The test defines a sequence starting with \( s_0 = 4 \), and iterates \( s_i = s_{i-1}^2 - 2 \pmod{M_p} \) for \( i = 1 \) to \( p-2 \); \( M_p \) is prime if and only if \( s_{p-2} \equiv 0 \pmod{M_p} \). This deterministic procedure exploits the algebraic structure of Mersenne numbers, requiring only \( O(p) \) squarings modulo \( M_p \), and has been instrumental in discovering all known Mersenne primes.

The Agrawal-Kayal-Saxena (AKS) algorithm, published in 2002 and formalized in 2004, provides the first general deterministic polynomial-time proof of primality, placing PRIMES in P. It verifies that an integer \( n \u003e 1 \) is prime by first checking it is not a perfect power and selecting an integer \( r \) such that the multiplicative order of \( n \) modulo \( r \) exceeds \( \log^2 n \), then confirming the polynomial identity \( (x + a)^n \equiv x^n + a \pmod{n, x^r - 1} \) holds for \( a = 1 \) to \( \lceil 2(\log n)^2 \rceil \), using repeated squaring for efficiency. This relies on the non-vanishing of certain polynomial congruences in \( \mathbb{Z}/n\mathbb{Z}[x] \), which fail if \( n \) is composite; the full proof runs in \( O(\log^{6} n) \) time with optimizations reducing it to \( O(\log^{4.5} n) \), though practical implementations favor certificate-based methods for large numbers due to AKS's constants.

### Largest Known Primes and Special Algorithms

The largest known prime number, as of November 2025, is the Mersenne prime \(2^{136279841} - 1\), which contains 41,024,320 decimal digits and was discovered on October 12, 2024, by amateur mathematician Luke Durant using GPU-based computation. This marks the 52nd known Mersenne prime and surpasses the previous record by over 16 million digits, highlighting the rarity and scale of such discoveries. Mersenne primes, of the form \(2^p - 1\) where \(p\) is prime, dominate records due to their amenability to specialized testing, with all top 10 largest known primes being Mersenne numbers.

The Great Internet Mersenne Prime Search (GIMPS), a volunteer distributed computing project launched in 1996, has driven most major discoveries, including this record, by harnessing ordinary computers worldwide to test candidates via efficient algorithms. GIMPS relies on the Lucas-Lehmer primality test, a deterministic method tailored for Mersenne numbers that avoids full factorization or general sieving for these enormous scales. For a candidate \(M_p = 2^p - 1\) with prime exponent \(p \u003e 2\), the test defines the sequence starting with \(s_0 = 4\), where subsequent terms are given by

\[
s_i = s_{i-1}^2 - 2 \pmod{M_p}
\]

for \(i = 1, 2, \dots, p-2\). The number \(M_p\) is prime if and only if \(s_{p-2} \equiv 0 \pmod{M_p}\). This sequence's rapid growth is managed through modular arithmetic, enabling verification of primes with millions of digits in feasible time on modern hardware.

Beyond Mersenne forms, other special structures yield notable large primes using analogous probabilistic or deterministic tests. Proth primes, expressed as \(k \cdot 2^n + 1\) with odd \(k \u003c 2^n\), support efficient primality proving via the Lucas-Lehmer-Riesel test, a generalization of the Mersenne method. A notable example is \(281 \cdot 2^{2051865} + 1\), with approximately 617,311 digits, discovered in 2022 through distributed searches. Similarly, Cullen primes of the form \(n \cdot 2^n + 1\) and their generalizations \(n \cdot b^n + 1\) (for integer \(b \u003e 1\)) are pursued in projects like PrimeGrid's searches. The current record generalized Cullen prime is \(4052186 \cdot 69^{4052186} + 1\), featuring 7,451,366 digits and found on April 17, 2025, ranking 16th overall among known primes. These forms underscore how tailored algorithms exploit algebraic structure to identify record-breaking primes beyond general methods.

### Integer Factorization

Integer factorization is the process of decomposing a composite integer into its prime factors, serving as the computational inverse to determining primality. This task underpins the security of certain cryptographic systems, as the difficulty of factoring large semiprimes—products of two large primes—is assumed to be intractable with classical computing resources. The fundamental theorem of arithmetic guarantees that every integer greater than 1 has a unique prime factorization, providing the theoretical basis for these algorithms.

Basic trial division, which checks for factors by dividing the integer by all primes up to its square root, becomes inefficient for large numbers but can be extended for medium-sized composites using probabilistic methods like Pollard's rho algorithm. Introduced by John Pollard in 1975, Pollard's rho detects non-trivial factors by generating a pseudorandom sequence via a polynomial iteration, such as \(x_{i+1} = x_i^2 + c \mod n\), and using cycle detection (via Floyd's tortoise and hare) to find a collision that reveals a factor through the greatest common divisor. This method excels for numbers up to about 10^{20}, particularly when one factor is small, and is faster than trial division for medium sizes due to its expected \(O(\sqrt{p})\) runtime, where \(p\) is the smallest prime factor.

For larger integers, the quadratic sieve algorithm improves efficiency by exploiting quadratic residues. Developed by Carl Pomerance in 1982, it sieves values of \(Q(x) = (x + \lfloor \sqrt{n} \rfloor)^2 - n\) for smooth factors over a factor base of small primes, constructing a matrix of exponent vectors modulo 2 for these primes. A linear dependence among \(B+1\) such vectors (where \(B\) is the factor base size) yields a congruence \(x^2 \equiv y^2 \mod n\), and \(\gcd(x - y, n)\) provides a non-trivial factor. The algorithm's subexponential time complexity, approximately \(O(\exp(\sqrt{\log n \log \log n}))\), makes it suitable for factoring numbers up to around 100 digits.

The general number field sieve (GNFS) represents the state-of-the-art classical method for factoring very large integers, extending the quadratic sieve to multiple algebraic rings. Its heuristic time complexity is given by

\[
L_n[1/3, (64/9)^{1/3}] = \exp\left( (64/9)^{1/3} (\log n)^{1/3} (\log \log n)^{2/3} \right),
\]

where \(L_n[a, c]\) denotes the subexponential form, making it asymptotically faster than the quadratic sieve for numbers exceeding 100 digits. GNFS has achieved record factorizations, such as RSA-250, an 829-bit semiprime factored in 2020 by a Franco-American team using the CADO-NFS implementation on distributed computing resources, taking approximately 2,700 CPU-years. This broke the RSA Factoring Challenge modulus into two 250-digit primes, demonstrating practical feasibility for cryptographic sizes up to about 250 bits.

In cryptography, efficient integer factorization enables breaking public-key systems like RSA, where the private key derives from the prime factors of the public modulus; thus, advances in factorization directly threaten secure communications, digital signatures, and data encryption protocols reliant on the RSA problem's hardness. As of 2025, while quantum algorithms like Shor's pose a long-term threat by enabling polynomial-time factorization on sufficiently large quantum computers, classical methods such as GNFS remain dominant for practical computations, with no scalable quantum implementation yet available for large semiprimes.

## Applications

### Geometry and Constructions

In 1796, at the age of 19, Carl Friedrich Gauss discovered a method to construct a regular 17-sided polygon (heptadecagon) using only straightedge and compass, marking a significant advancement in classical geometry. This breakthrough, detailed in his later work *Disquisitiones Arithmeticae* (1801), extended the ancient Greek constructions of equilateral triangles, squares, and pentagons to certain polygons with prime numbers of sides. Gauss's insight connected number theory to geometric constructibility, showing that the possibility of such constructions depends on the prime factorization of the number of sides.

Gauss established that a regular $n$-gon with $n \geq 3$ is constructible with straightedge and compass if and only if $n = 2^k \prod_{i=1}^m p_i$, where $k \geq 0$ is an integer and the $p_i$ are distinct Fermat primes. Fermat primes are primes of the form $F_m = 2^{2^m} + 1$, and the only known such primes are $F_0 = 3$, $F_1 = 5$, $F_2 = 17$, $F_3 = 257$, and $F_4 = 65537$. These primes play a crucial role in enabling constructions beyond powers of 2; for instance, the 17-gon is constructible because 17 is a Fermat prime, allowing the division of the circle into 17 equal arcs via quadratic extensions of the rationals. Without additional Fermat primes, there are only 31 constructible regular $n$-gons with an odd number of sides, corresponding to the nonempty products of these five primes.

The theoretical foundation for this constructibility lies in the cyclotomic fields generated by the primitive $n$th roots of unity. The degree of the $n$th cyclotomic extension $\mathbb{Q}(\zeta_n)/\mathbb{Q}$ equals Euler's totient function $\phi(n)$, where $\zeta_n = e^{2\pi i / n}$. For the regular $n$-gon to be constructible, this degree must be a power of 2, as each compass-and-straightedge step corresponds to solving quadratic equations, building a tower of quadratic extensions. When $n = 2^k \prod p_i$ with distinct Fermat primes $p_i$, $\phi(n) = 2^{k-1} \prod (p_i - 1)$ simplifies to a power of 2, since each $p_i - 1 = 2^{2^{m_i}}$. This algebraic condition ensures the coordinates of the vertices lie in a field obtainable through repeated square roots.

Prime numbers also influence polygon partitions, particularly in dissections and tilings where the prime factorization dictates the subdivision process. In fractal tiling methods, a regular polygon can be iteratively fragmented according to the prime factors of an integer $n \geq 2$, starting with division into $p_1$ congruent tiles (where $p_1$ is the smallest prime factor), then subdividing each into $p_2$ tiles, and so on. For prime $n = p$, this yields a simple radial dissection into $p$ identical sectors from a central vertex, forming self-similar patterns when iterated; for composite $n$ with prime factors, the process creates bounded, non-hyperbolic tilings that visualize the multiplicative structure of primes geometrically. Such constructions highlight primes' indivisibility, as a prime-sided polygon resists further equitable dissection without introducing irregular tiles.

### Physics and Quantum Mechanics

In quantum chaos, the non-trivial zeros of the Riemann zeta function, which govern the distribution of prime numbers through the explicit formula relating primes to zeta zeros, exhibit statistical properties analogous to the eigenvalues of quantum systems with chaotic classical counterparts. This connection stems from the Hilbert-Pólya conjecture, proposing that these zeros correspond to the spectrum of a self-adjoint operator, potentially arising from a quantized chaotic Hamiltonian, as suggested by the resemblance between zeta zero correlations and those predicted by random matrix theory for chaotic quantum billiards. For instance, the pair correlation of zeta zeros matches the level repulsion observed in eigenvalues of unitary random matrices, linking prime number theory to universal features of quantum chaos.

Further explorations model prime-related spectra within quantum field theory frameworks, where zeta zeros are interpreted as regularizable spectral determinants, enabling functional integral constructions for self-adjoint operators, unlike the prime sequence itself, which lacks such regularizability. Quantum graphs have been constructed whose length spectra mimic the imaginary parts of Riemann zeros, providing a physical realization where prime distributions indirectly influence chaotic quantum dynamics.

A prominent application of primes in quantum mechanics is Shor's algorithm, a quantum computing procedure for integer factorization that exploits period-finding to efficiently determine the prime factors of large semiprimes, posing a severe threat to RSA encryption reliant on the difficulty of factoring products of large primes. Developed in 1994, the algorithm reduces factorization to finding the order \( r \) of a random base \( a \) modulo \( N \) (where \( N \) is the number to factor and \( \gcd(a, N) = 1 \)), such that \( a^r \equiv 1 \pmod{N} \), using quantum parallelism for superposition-based modular exponentiation followed by measurement.

The core quantum subroutine employs the quantum Fourier transform (QFT) to extract the period \( r \) from the superposition state, achieving exponential speedup over classical methods via phase estimation on the unitary operator implementing \( a^x \mod N \). Specifically, after preparing the state \( \sum_{x=0}^{q-1} |x\rangle |a^x \mod N\rangle \) (with \( q \) a power of 2 larger than \( N^2 \)), applying the QFT to the first register yields peaks at multiples of \( q/r \), from which \( r \) is classically recovered with high probability, enabling subsequent factorization via the difference of squares if \( r \) is even.

This quantum vulnerability extends to prime-based encryption schemes, such as the Diffie-Hellman key exchange, which relies on the discrete logarithm problem in the multiplicative group modulo a large prime \( p \), where computing \( g^{ab} \mod p \) from public \( g^a \mod p \) and \( g^b \mod p \) (with generator \( g \)) is intractable classically but solvable quantumly via Shor's adaptation. Similarly, elliptic curve discrete logarithm-based systems, like elliptic curve Diffie-Hellman (ECDH), use the hardness of finding the scalar \( k \) such that \( Q = kP \) on an elliptic curve over a prime field \( \mathbb{F}_p \), offering compact keys but facing analogous quantum threats from period-finding on the curve group. These protocols underpin secure communications, with Shor's algorithm highlighting the need for post-quantum alternatives to protect prime-dependent cryptography.

### Biology and Natural Patterns

Periodical cicadas of the genus *Magicicada* exhibit life cycles of 13 or 17 years, both prime numbers, which evolutionary models suggest evolved to minimize synchronization with predators that have shorter, non-prime cycles. This prime periodicity reduces the frequency of overlapping emergences, as prime intervals share fewer common multiples with typical predator cycles, thereby decreasing predation risk during mass emergences that overwhelm remaining predators. Numerical simulations demonstrate that under conditions near population extinction, such as cooler glacial climates, prime-numbered cycles like 13 and 17 years persist while non-prime alternatives (e.g., 12 or 15 years) are selected against due to higher hybridization and predation vulnerability. Spatial evolutionary models further show that prime periods emerge spontaneously in prey populations as an adaptive strategy against predators with variable cycles, mirroring observed cicada behavior.

In genomics, prime numbers appear in the context of "nullomers" and "primes," which are short DNA sequences absent from specific or all known genomes, respectively, highlighting non-random evolutionary constraints on sequence space. For instance, protein primes—short amino acid sequences missing across GenBank—average half the expected coding DNA sequences for their length, indicating selective pressures that avoid certain motifs. A 2023 study introduced "nucleic quasi-primes" as the shortest oligonucleotides unique to individual species, enabling precise genomic identification across over 45,000 taxa, including humans, and revealing patterns of species-specificity in DNA distributions. These findings from 2020s research underscore prime-related distributions in avoiding lethal or redundant sequences, with applications in biodiversity analysis and therapeutic design.

Prime numbers intersect with biological growth patterns through the Fibonacci sequence, where Fibonacci primes (e.g., 2, 3, 5, 13, 89) occur rarely but model natural phenomena like plant branching and leaf arrangements. In phyllotaxis, the spiral patterns of leaves or seeds on plants often follow consecutive Fibonacci numbers as parastichy pairs (m, n) that are relatively prime, ensuring efficient packing without overlap; while not exclusively primes, this coprimality—characteristic of primes—generates diverse, non-repeating spirals observed in sunflowers and pinecones. Evolutionary models of population dynamics also produce prime periods as stable outcomes in predator-prey interactions, extending beyond cicadas to general biological synchronization where primes minimize periodic collisions. Insights from life sciences affirm that such prime properties predate human recognition, influencing innate numerical discrimination in animals like chicks that distinguish prime from composite quantities.

### Culture, Arts, and Literature

In literature, prime numbers have served as symbols of universal communication and intellectual pursuit. In Carl Sagan's 1985 novel *Contact*, extraterrestrial intelligence signals Earth using a sequence of prime numbers, chosen for their fundamental and unambiguous mathematical nature, allowing humans to decode the message as evidence of alien technology. Similarly, Neal Stephenson's 1999 novel *Cryptonomicon* weaves primes into its narrative of cryptography during World War II and modern digital security, portraying large prime factorization as central to unbreakable codes and data protection schemes.

In the arts, prime numbers inspire visual representations that blend mathematics with aesthetics. The Ulam spiral, devised by Stanisław Ulam in 1963, arranges natural numbers in a square spiral and highlights primes, revealing unexpected diagonal patterns that have influenced generative art and digital prints exploring numerical beauty. Artists like Paul Ashwell have adapted this spiral into works such as *UlamX6*, a digital print that accentuates prime positions to evoke the organic yet structured essence of mathematical discovery.

Music composers have incorporated prime numbers to create complex rhythms and scales, evoking tension and timelessness. Olivier Messiaen, in pieces like his *Quartet for the End of Time* (1941), employed prime-based durations—such as cycles of 17 or 29 beats—to generate non-repeating patterns that mimic eternity and defy conventional meter. Progressive rock bands, including King Crimson, have used prime time signatures like 5/4, 7/8, and 11/8 in tracks such as "21st Century Schizoid Man" to produce polyrhythmic dissonance and structural unpredictability.

Prime numbers feature prominently in recreational puzzles, enhancing logic games with mathematical constraints. Variants of Sudoku, such as "Prime Sudoku," restrict cells to prime digits (2, 3, 5, 7) or require cage sums to be prime, as seen in puzzles from the Murderous Maths series, which challenge solvers to fill grids while adhering to these indivisible rules. Other examples include "All Primes Sudoku" on platforms like Logic Masters, where row or column clues count two-digit primes, adding layers of enumeration to the standard grid-filling mechanic.

Culturally, primes hold non-mathematical significance in numerology and calendrical systems across traditions. In Hindu culture, primes like 3, 5, 7, and 11 symbolize purity and divine order, appearing in rituals such as the five daily prayers or eleven Rudras in Vedic texts, reflecting their role as foundational elements beyond arithmetic. The seven-day week, rooted in ancient Mesopotamian and Judeo-Christian calendars, derives part of its enduring structure from 7's prime indivisibility, which imbued it with mystical completeness in folklore and religious observance.