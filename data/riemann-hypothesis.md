# Riemann hypothesis

The **Riemann hypothesis** is a conjecture in analytic number theory stating that all nontrivial zeros of the Riemann zeta function have real part equal to 1/2.

Proposed by German mathematician Bernhard Riemann in his 1859 paper "On the Number of Primes Less Than a Given Magnitude," the hypothesis concerns the zeta function ζ(s), originally defined as the infinite series ∑_{n=1}^∞ 1/n^s for complex numbers s with real part greater than 1, and extended analytically to the rest of the complex plane. The function has trivial zeros at the negative even integers s = -2, -4, -6, ..., but the nontrivial zeros—those in the critical strip where the real part of s is between 0 and 1—are conjectured to lie precisely on the **critical line** where the real part is exactly 1/2.

This hypothesis is profoundly significant because it provides the sharpest possible bound on the error term in the prime number theorem, which describes the asymptotic distribution of prime numbers. Specifically, it is equivalent to the statement that the difference between the prime-counting function π(x) and the logarithmic integral Li(x) satisfies |π(x) - Li(x)| \u003c c √x log x for some constant c \u003e 0 and all sufficiently large x. A proof would refine our understanding of prime distribution, impacting fields from cryptography to quantum physics, and validate hundreds of conditional theorems in number theory.

Despite extensive computational verification—confirming the hypothesis for the first 10^{13} nontrivial zeros—the conjecture remains unproven after over 165 years. It was included in David Hilbert's list of 23 unsolved problems in 1900 and is one of the seven Millennium Prize Problems designated by the Clay Mathematics Institute in 2000, offering a $1 million reward for a correct proof or disproof. Recent advances, such as the 2024 work by mathematicians Larry Guth and James Maynard, have improved bounds on the location of potential counterexamples, narrowing the search for zeros off the critical line and advancing related estimates in analytic number theory.

## Foundations of the Zeta Function

### Definition and Series Representation

The Riemann zeta function, denoted \(\zeta(s)\), is initially defined for complex numbers \(s\) with real part \(\operatorname{Re}(s) \u003e 1\) by the Dirichlet series
\[
\zeta(s) = \sum_{n=1}^\infty \frac{1}{n^s}.
\]
This infinite sum converges absolutely in the half-plane \(\operatorname{Re}(s) \u003e 1\), as established by comparison with the integral test or ratio test applied to the terms. On the boundary line \(\operatorname{Re}(s) = 1\) (except at \(s=1\)), the series converges conditionally, owing to the Dirichlet test for convergence, where the partial sums of the oscillatory factors \(n^{-it}\) (for \(t \
eq 0\)) remain bounded.

A fundamental representation of \(\zeta(s)\) in the region \(\operatorname{Re}(s) \u003e 1\) is given by the Euler product formula,
\[
\zeta(s) = \prod_p \left(1 - p^{-s}\right)^{-1},
\]
where the product runs over all prime numbers \(p\). This expression arises from the unique prime factorization theorem in the integers, as expanding each geometric series \((1 - p^{-s})^{-1} = \sum_{k=0}^\infty p^{-ks}\) and multiplying over primes yields the Dirichlet series over all positive integers \(n\), with each \(n\) appearing exactly once via its prime factors. The Euler product highlights the intimate connection between \(\zeta(s)\) and the distribution of primes, since the convergence of the product mirrors that of the sum over primes \(\sum_p p^{-\sigma}\) for \(\sigma \u003e 1\).

At \(s=1\), the series reduces to the harmonic series \(\sum_{n=1}^\infty 1/n\), which diverges, indicating that \(\zeta(s)\) has a simple pole at this point with residue 1. The Laurent series expansion around \(s=1\) is
\[
\zeta(s) = \frac{1}{s-1} + \sum_{k=0}^\infty \frac{(-1)^k \gamma_k}{k!} (s-1)^k,
\]
where \(\gamma_0 = \gamma\) is the Euler-Mascheroni constant and \(\gamma_k\) are Stieltjes constants; the residue 1 directly ties to the logarithmic divergence of the harmonic series.

For positive even integers, explicit values of \(\zeta(s)\) are known and linked to Bernoulli numbers \(B_m\). Specifically,
\[
\zeta(2k) = (-1)^{k+1} \frac{B_{2k} (2\pi)^{2k}}{2 (2k)!}, \quad k = 1, 2, \dots
\]
For \(k=1\), this yields \(\zeta(2) = \pi^2 / 6\), the solution to the Basel problem first obtained by Euler in 1734. For \(k=2\), \(\zeta(4) = \pi^4 / 90\). These evaluations stem from Euler's summation techniques involving trigonometric series and the reflection formula for the cotangent function, establishing a bridge to transcendental number theory.

### Analytic Continuation and Functional Equation

In his 1859 paper, Bernhard Riemann established the analytic continuation of the Riemann zeta function \(\zeta(s)\), initially defined by the Dirichlet series \(\sum_{n=1}^\infty n^{-s}\) for \(\operatorname{Re}(s) \u003e 1\), to a meromorphic function on the entire complex plane, featuring a single simple pole at \(s=1\) with residue 1. Riemann achieved this extension by expressing \(\zeta(s)\) through an integral representation involving the Gamma function: \(\Gamma(s) \zeta(s) = \int_0^\infty \frac{x^{s-1}}{e^x - 1} \, dx\), valid initially for \(\operatorname{Re}(s) \u003e 1\), and then deforming the contour of integration to avoid the pole at \(s=1\) while demonstrating holomorphy elsewhere. This contour integral approach, combined with the introduction of the Jacobi theta function \(\	heta(x) = \sum_{n=-\infty}^\infty e^{-\pi n^2 x}\) for \(x \u003e 0\), allowed Riemann to rigorously define \(\zeta(s)\) for all complex \(s \
eq 1\).

Subsequent derivations of the analytic continuation have employed alternative methods, such as the Euler-Maclaurin summation formula to extend the series representation stepwise to \(\operatorname{Re}(s) \u003e -n\) for positive integers \(n\), or Fourier series expansions of periodic functions to obtain integral representations valid in larger half-planes. Another classical approach utilizes the Poisson summation formula applied to the theta function, yielding a representation that converges for \(\operatorname{Re}(s) \u003c 0\) and facilitates matching with the original series to cover the whole plane. These methods confirm Riemann's result that \(\zeta(s)\) is meromorphic with no other poles.

Central to this continuation is the functional equation, which Riemann derived using the theta function's transformation property under inversion: \(\	heta(1/x) = \sqrt{x} \	heta(x)\). The equation states:
$$
\zeta(s) = 2^s \pi^{s-1} \sin\left(\frac{\pi s}{2}\right) \Gamma(1-s) \zeta(1-s),
$$
valid for all complex \(s \
eq 1\). A symmetric form, often expressed via the completed zeta function \(\xi(s) = \frac{s(s-1)}{2} \pi^{-s/2} \Gamma(s/2) \zeta(s)\), satisfies \(\xi(s) = \xi(1-s)\), highlighting the inherent symmetry of \(\zeta(s)\) across the critical line \(\operatorname{Re}(s) = 1/2\). This reflection principle implies that the behavior of \(\zeta(s)\) in the right half-plane mirrors that in the left, adjusted by the factor involving the sine and Gamma functions.

The functional equation directly accounts for the trivial zeros of \(\zeta(s)\), located at the negative even integers \(s = -2, -4, -6, \dots\). These arise because \(\sin(\pi s / 2) = 0\) at these points, while \(\zeta(1-s)\) remains finite and non-zero there, ensuring the product vanishes. No other zeros occur in \(\operatorname{Re}(s) \leq 0\) except these trivial ones, as confirmed by the meromorphic nature of the continuation.

## Statement and Historical Development

### Formulation by Riemann

In his 1859 memoir titled *On the Number of Primes Less Than a Given Magnitude*, a concise eight-page paper submitted to the Berlin Academy, Bernhard Riemann introduced key properties of the Riemann zeta function ζ(s) and formulated what is now known as the Riemann hypothesis.

Riemann defined the non-trivial zeros of ζ(s) as those located within the critical strip where 0 \u003c Re(s) \u003c 1, distinguishing them from the trivial zeros at negative even integers. He conjectured that all non-trivial zeros lie on the critical line Re(s) = 1/2, expressing this through the related function ξ(s) = (s/2)(s - 1) π^{-s/2} Γ(s/2) ζ(s), which satisfies ξ(s) = ξ(1 - s) and for which the zeros correspond to those of ζ(s) in the strip. Specifically, Riemann stated that "it is very probable that all the roots [of ξ(t) = 0 for s = 1/2 + it] are real," implying their positions on the critical line.

Riemann further suggested that these zeros are simple and alternate along the line, supporting his conjecture with an explicit asymptotic formula for their distribution: the number of zeros with imaginary part between 0 and T is approximately (T / 2π) log(T / 2π) - T / 2π + O(log T), derived using properties of the gamma function including the relation involving π cot(πs) in the logarithmic derivative.

As initial evidence, Riemann manually computed the first three non-trivial zeros, finding them at approximately 1/2 + 14.13i, 1/2 + 21.02i, and 1/2 + 25.01i, all lying on the critical line.

### Early Verifications and Influences

Following Riemann's 1859 formulation, early efforts focused on establishing partial results about the locations of the zeta function's zeros. The Euler product representation, \(\zeta(s) = \prod_p (1 - p^{-s})^{-1}\) for primes \(p\), converges absolutely for \(\operatorname{Re}(s) \u003e 1\) and equals a product of non-zero terms, implying no zeros in this half-plane. In 1896, Jacques Hadamard proved that \(\zeta(s)\) has no zeros on the boundary line \(\operatorname{Re}(s) = 1\), using properties of the zeta function's growth and its logarithmic derivative to show that any such zero would contradict the function's analytic behavior. Independently in the same year, Charles-Jean de la Vallée Poussin established the same non-vanishing result on \(\operatorname{Re}(s) = 1\) and extended it to a zero-free region \(\operatorname{Re}(s) \geq 1 - c / \log |t|\) for some constant \(c \u003e 0\) and imaginary part \(t\), leveraging contour integration and estimates on the zeta function. Combined with the functional equation, these findings confined all non-trivial zeros to the critical strip \(0 \u003c \operatorname{Re}(s) \u003c 1\).

These advancements culminated in the proofs of the Prime Number Theorem by Hadamard and de la Vallée Poussin, which linked the asymptotic distribution of primes to the absence of zeros near \(\operatorname{Re}(s) = 1\). Hadamard's approach emphasized the zeta function's order of growth, while de la Vallée Poussin's incorporated explicit zero-free strips to bound the error in prime-counting estimates. The intellectual roots of these developments trace back to Carl Friedrich Gauss's conjectures on prime density around 1792–1800, which suggested \(\pi(x) \sim x / \log x\), and to Peter Gustav Lejeune Dirichlet's 1837 theorem proving infinitely many primes in arithmetic progressions via non-vanishing L-functions, providing the analytic framework Riemann later extended.

Numerical verification began with J. P. Gram's 1903 computations, which systematically evaluated the zeta function along the critical line \(\operatorname{Re}(s) = 1/2\) up to height \(t \approx 50\) and confirmed that the first 10 non-trivial zeros adhere precisely to this line, offering initial empirical support for the hypothesis. In 1900, David Hilbert spotlighted the Riemann hypothesis as the eighth of his 23 problems at the International Congress of Mathematicians, framing it as a cornerstone for understanding prime distribution and urging its resolution to advance number theory. This endorsement transformed the conjecture from a specialized analytic insight into a defining challenge of early 20th-century mathematics.

## Implications for Prime Distribution

### Connection to the Prime Number Theorem

The Prime Number Theorem asserts that the prime-counting function π(x), which enumerates the number of primes less than or equal to x, satisfies π(x) ∼ x / log x as x → ∞, or equivalently π(x) ∼ Li(x), where Li(x) is the logarithmic integral function. This result was independently established in 1896 by Jacques Hadamard and Charles Jean de la Vallée Poussin using complex analysis on the Riemann zeta function, without assuming the Riemann Hypothesis. A closely related formulation involves the Chebyshev function ψ(x) = ∑_{p^k ≤ x} log p, which sums the logarithms of primes weighted by their powers; the Prime Number Theorem is equivalent to the asymptotic ψ(x) ∼ x.

The explicit connection between the zeta function's non-trivial zeros and prime distribution is captured by von Mangoldt's explicit formula:

$$
\psi(x) = x - \sum_{\rho} \frac{x^{\rho}}{\rho} - \log(2\pi) - \frac{1}{2} \log\left(1 - \frac{1}{x^2}\right),
$$

where the sum runs over all non-trivial zeros ρ of the zeta function (with appropriate convergence considerations). Derived by Hans von Mangoldt in 1895, this formula reveals that deviations of ψ(x) from x are directly influenced by the positions of these zeros.

Under the Riemann Hypothesis, which conjectures that all non-trivial zeros ρ satisfy Re(ρ) = 1/2, the error term in the Prime Number Theorem improves dramatically to |π(x) - Li(x)| = O(√x log x), or equivalently |ψ(x) - x| = O(√x log x). In contrast, the unconditional error term, established by de la Vallée Poussin in 1896, is weaker: |π(x) - Li(x)| = O(x \exp(-c \sqrt{\log x})) for some constant c \u003e 0.

The oscillatory terms x^ρ / ρ in the explicit formula generate fluctuations in ψ(x) - x, whose amplitudes and phases depend on the imaginary parts of the zeros; these oscillations underlie irregularities in prime distribution, including the formation of prime gaps and local clustering of primes around certain intervals.

### Role of Non-Trivial Zeros in Error Estimates

The horizontal distribution of the non-trivial zeros of the Riemann zeta function \(\zeta(s)\) significantly influences the precision of error estimates in the prime number theorem, which states that the number of primes up to \(x\), denoted \(\pi(x)\), satisfies \(\pi(x) \sim x / \log x\). Zero-free regions to the right of the critical line \(\operatorname{Re}(s) = 1/2\) limit how close these zeros can approach \(\operatorname{Re}(s) = 1\), thereby bounding the oscillatory contributions from the zeros to the error term \(\pi(x) - \operatorname{li}(x)\), where \(\operatorname{li}(x)\) is the logarithmic integral.

Classical proofs of the prime number theorem establish zero-free regions of the form \(\sigma \u003e 1 - c / \log |t|\) for \(\operatorname{Im}(s) = t\) sufficiently large, where \(c \u003e 0\) is an absolute constant; this ensures that \(\zeta(s) \
eq 0\) in such regions, preventing excessively large deviations in prime distribution. De la Vallée Poussin established this classical zero-free region in his 1899 work, yielding explicit constants in the error term for \(\pi(x)\). Later refinements, such as by Vinogradov and Korobov in 1958, provided stronger zero-free regions of the form \(\sigma \geq 1 - c / (\log t)^{2/3} (\log \log t)^{1/3}\) for large \(t\), further improving error bounds. These regions arise from analyzing the growth of \(\zeta(s)\) near \(\operatorname{Re}(s) = 1\) and have limitations, as zeros can still approach the line \(\operatorname{Re}(s) = 1\) arbitrarily closely, albeit infrequently, leading to suboptimal error bounds without further assumptions.

The Riemann hypothesis is equivalent to the optimal error estimate \(\pi(x) = \operatorname{li}(x) + O(\sqrt{x} \log x)\), achieved precisely when all non-trivial zeros lie on \(\operatorname{Re}(s) = 1/2\), minimizing the horizontal spread and thus the magnitude of their contributions to prime-counting discrepancies. Without the hypothesis, weaker zero-free regions imply larger errors, such as \(O(x \exp(-c \sqrt{\log x}))\), but the hypothesis provides the sharpest possible bound by confining zeros to the critical line.

Density theorems quantify the scarcity of zeros in rectangular regions of the critical strip, offering bounds on their horizontal distribution. H. R. Davenport developed key zero-density estimates, showing that the number of zeros \(N(\sigma, T)\) with \(\operatorname{Re}(s) \geq \sigma\) and \(|\operatorname{Im}(s)| \leq T\) satisfies \(N(\sigma, T) \ll T^{a(1-\sigma)} (\log T)^b\) for \(1/2 \u003c \sigma \u003c 1\), where \(a\) and \(b\) are positive constants depending on \(\sigma\); these estimates, refined over time—including a 2024 improvement by Guth and Maynard to \(N(\sigma, T) \le T^{30(1-\sigma)/13 + o(1)}\)—reveal that most zeros cluster near \(\operatorname{Re}(s) = 1/2\) while few stray rightward, directly impacting the scale of error terms in prime distribution and asymptotics for primes in short intervals.

The positioning of non-trivial zeros also affects prime gaps, the differences between consecutive primes. If zeros lie off the critical line, zero-free regions permit larger deviations, potentially allowing gaps exceeding \(\sqrt{x} \log x\) for primes around \(x\); however, the Riemann hypothesis implies that all gaps up to \(x\) are \(O(\sqrt{x} \log x)\), as proven by Cramér in 1936 using the explicit formula linking primes to zeros.

## Arithmetic and Analytic Consequences

### Growth of Arithmetic Functions

The Riemann hypothesis (RH) provides sharp bounds on the growth of various arithmetic functions by controlling the locations of the non-trivial zeros of the Riemann zeta function, which in turn affect the error terms in their summatory functions through Perron's formula and related analytic techniques. These bounds arise from the assumption that all non-trivial zeros lie on the critical line Re(s) = 1/2, leading to improved estimates compared to unconditional results. Such constraints have significant implications for understanding the distribution and magnitude of multiplicative functions in number theory.

For the sum-of-divisors function σ(n), which sums the positive divisors of n, RH implies a precise asymptotic for its partial sum. Specifically, the summatory function satisfies

\[
\sum_{n \le x} \sigma(n) = \frac{\pi^2}{12} x^2 + O\left(x^{3/2 + \varepsilon}\right)
\]

for any ε \u003e 0, where the main term derives from the residue at s=2 of ζ(s)^2, and the error term reflects the contribution from the critical strip under RH. This improves upon the unconditional error O(x^{4/3 + ε}), highlighting how zero-free regions sharpen the approximation.

RH also refines Mertens' theorems on prime products. The product over primes p ≤ x of (1 - 1/p)^{-1} is asymptotically e^γ log x, where γ is the Euler-Mascheroni constant, and under RH the error term is O(√x), stemming from the O(√x log x) bound in the prime number theorem via integration by parts on the sum of 1/p. This sharpening aids in estimating harmonic series and Euler products more accurately.

Regarding the Euler totient function φ(n), which counts integers up to n coprime to n, the minimal order for n ≤ x is x exp(-c log x / log log x) for some constant c \u003e 0 unconditionally, reflecting highly composite n with many small prime factors. However, RH implies stronger bounds on discrepancies in the distribution of φ(n), such as in the error for ∑_{n ≤ x} φ(n) = (3/π²) x² + O(x^{3/2 + ε}), by linking to zero contributions in the Dirichlet series for φ. These improvements clarify deviations from the average value (6/π²) n.

A key equivalence involves Landau's problem on the Chebyshev function for Dirichlet characters. RH is equivalent to the bound ψ(x; χ) ≪ √x (log x)^2 for non-principal characters χ, where ψ(x; χ) = ∑_{n ≤ x} Λ(n) χ(n) and Λ is the von Mangoldt function; this follows from the explicit formula relating ψ to sums over L-function zeros. This criterion underscores RH's role in generalizing prime distribution to arithmetic progressions.

Finally, for the Möbius function μ(n), which is multiplicative and takes values -1, 0, or 1 based on square-free factorization, RH implies ∑_{n ≤ x} μ(n) = O(x^{1/2 + ε}) for any ε \u003e 0. This bound, tighter than the unconditional o(x), is essentially equivalent to RH and controls the oscillation of μ through the prime number theorem for arithmetic progressions.

### Equivalent Analytic Criteria

The Lindelöf hypothesis asserts that for every ε \u003e 0, |ζ(1/2 + it)| = O(t^ε) as t → ∞. This conjecture is implied by the Riemann hypothesis, as the location of all non-trivial zeros on the critical line Re(s) = 1/2 would restrict the growth of ζ(s) along that line to polylogarithmic order. However, the Lindelöf hypothesis is strictly weaker than the Riemann hypothesis, since subconvexity bounds of the form |ζ(1/2 + it)| ≪ t^{1/6 - δ} for some δ \u003e 0 can hold without all zeros lying on the critical line.

A key analytic reformulation of the Riemann hypothesis involves the moments of the zeta function on the critical line. Specifically, the Riemann hypothesis is equivalent to the statement that for every positive integer k, the 2k-th moment satisfies

\[\int_0^T |\zeta(1/2 + it)|^{2k} \, dt \sim g_k (\log T)^{k^2}\]

as T → ∞, where g_k \u003e 0 is an explicit arithmetic constant given by

\[g_k = \prod_p \left(1 - \frac{1}{p}\right)^{k^2} \left(1 + \frac{k(k-1)}{p^2} + \cdots + \frac{1}{p^{2k}}\right).\] This asymptotic captures the leading behavior under the assumption that the zeros are precisely on Re(s) = 1/2, leading to a Gaussian-like distribution in the logarithm of |ζ(1/2 + it)|. Unconditionally, the leading term holds for k = 1 (second moment) due to Hardy and Littlewood, and partial results exist for higher k, but the full equivalence relies on the zero distribution dictated by the Riemann hypothesis.

A related result on the distribution of zeros near the critical line states that a positive proportion of non-trivial zeros lie on the critical line Re(s) = 1/2. Unconditionally, at least 41% of zeros up to height T lie on the line, with improvements due to Levinson (at least 1/3), Conrey (40%+), and later works exceeding 41%. The Riemann hypothesis asserts that the full proportion is 1, i.e., all non-trivial zeros lie on the line.

Omega theorems offer lower bounds on the growth of |ζ(1/2 + it)| that contrast with potential upper bounds under the Riemann hypothesis. Unconditionally, it is known that |ζ(1/2 + it)| = Ω( exp( c \log t / \log \log t ) ) for some constant c \u003e 0 and infinitely many t, reflecting large oscillations due to nearby zeros or other factors. The Riemann hypothesis would sharpen the upper bound to |ζ(1/2 + it)| = O( t^ε ) for any ε \u003e 0, consistent with the Lindelöf hypothesis, thereby bounding the extent of these large values while preserving the Omega lower bound. These results highlight the delicate balance in the zeta function's behavior on the critical line, where the hypothesis prevents excessive growth.

Li's criterion reformulates the Riemann hypothesis in terms of a sequence of real numbers {λ_n}. Define λ_n = \frac{1}{(n-1)!} \frac{d^n}{ds^n} \left[ s^{n-1} \log \xi(s) \right] \bigg|_{s=1} for n ≥ 1, where ξ(s) = s(s-1) π^{-s/2} Γ(s/2) ζ(s) is the completed zeta function. The Riemann hypothesis is equivalent to λ_n ≥ 0 for all n ≥ 1. This criterion arises from the Laurent expansion of log ξ(s) around s=1, where the coefficients λ_n encode information about the zeros through the explicit formula relating primes and zeros. Numerical computations confirm λ_n \u003e 0 for the first several thousand terms, providing supportive evidence, though the infinite positivity remains unproven. Extensions by Bombieri and Lagarias generalize this to arbitrary multisets of complex numbers satisfying growth conditions analogous to the zeros.

## Generalizations and Analogues

### Dirichlet L-Functions and Number Fields

The Dirichlet L-function attached to a primitive Dirichlet character \(\chi\) modulo \(q\) is defined by the Dirichlet series
\[
L(s, \chi) = \sum_{n=1}^\infty \frac{\chi(n)}{n^s}
\]
for \(\operatorname{Re}(s) \u003e 1\), where the series converges absolutely. This function admits a meromorphic continuation to the entire complex plane, holomorphic everywhere except for a simple pole at \(s=1\) when \(\chi\) is the principal character. The generalized Riemann hypothesis (GRH) for Dirichlet L-functions asserts that every non-trivial zero of \(L(s, \chi)\) has real part equal to \(1/2\).

A key implication of the GRH concerns the distribution of primes in arithmetic progressions. Assuming the GRH, the number of primes \(p \leq x\) with \(p \equiv a \pmod{q}\) and \((a, q) = 1\), denoted \(\pi(x; q, a)\), satisfies
\[
\pi(x; q, a) = \frac{\operatorname{li}(x)}{\phi(q)} + O\left(\sqrt{x} \log(qx)\right),
\]
where \(\operatorname{li}(x)\) is the logarithmic integral and \(\phi\) is Euler's totient function. This sharpens the unconditional prime number theorem for arithmetic progressions, providing an error term that reflects the critical line location of zeros and enables effective estimates for prime gaps in progressions.

For extensions to number fields, the Dedekind zeta function \(\zeta_K(s)\) of a number field \(K\) of degree \(n\) over \(\mathbb{Q}\) is given by
\[
\zeta_K(s) = \sum_{\mathfrak{a}} \frac{1}{N(\mathfrak{a})^s},
\]
where the sum runs over non-zero ideals \(\mathfrak{a}\) of the ring of integers of \(K\) and \(N(\mathfrak{a})\) is the norm, converging for \(\operatorname{Re}(s) \u003e 1\). It extends meromorphically to the complex plane with a simple pole at \(s=1\). The GRH extends to \(\zeta_K(s)\) (equivalently, to the Artin L-functions comprising its Euler product under the Artin conjecture), positing that all non-trivial zeros lie on \(\operatorname{Re}(s) = 1/2\).

The analytic class number formula relates the residue \(\kappa_K = \operatorname{Res}_{s=1} \zeta_K(s)\) to arithmetic invariants of \(K\):
\[
\kappa_K = \frac{2^{r_1} (2\pi)^{r_2} h_K R_K}{w_K \sqrt{|D_K|}},
\]
where \(r_1\) (resp., \(r_2\)) is the number of real (resp., complex) embeddings, \(h_K\) the class number, \(R_K\) the regulator, \(w_K\) the number of roots of unity, and \(D_K\) the discriminant. Under the GRH, effective upper bounds for \(h_K\) follow, such as \(h_K \ll_n |D_K|^{1/2} (\log |D_K|)^{n-1}\), sharpening control over ideal class groups.

Unconditionally, Siegel's theorem provides bounds on class numbers of quadratic fields, extended to general number fields via the Brauer–Siegel theorem: for any \(\epsilon \u003e 0\), \(h_K \ll_\epsilon |D_K|^{1/2 + \epsilon}\), though the implied constant is ineffective for small \(\epsilon\) due to potential Siegel zeros (real zeros close to \(s=1\)). The GRH eliminates such exceptional zeros, rendering the bounds effective and aligning the exponent \(1/2 + \epsilon\) with the conjectured optimal growth tied to the critical line.

### Zeta Functions over Function Fields

In the context of function fields over finite fields, the Riemann hypothesis finds a precise analogue through the zeta functions associated to algebraic varieties. For a smooth projective curve \(C\) of genus \(g\) defined over the finite field \(\mathbb{F}_q\), the zeta function is defined as
\[
Z(C, u) = \exp\left( \sum_{n=1}^\infty \frac{|C(\mathbb{F}_{q^n})| u^n}{n} \right),
\]
where \(|C(\mathbb{F}_{q^n})|\) denotes the number of rational points on \(C\) over the extension \(\mathbb{F}_{q^n}\). This zeta function admits a functional equation and can be expressed rationally as
\[
Z(C, u) = \frac{P(u)}{(1-u)(1-qu)},
\]
with \(P(u)\) a polynomial of degree \(2g\) whose roots lie on the circle \(|z| = q^{1/2}\) according to the analogue of the Riemann hypothesis.

The analogue of the Riemann hypothesis for such zeta functions was conjectured by André Weil in 1949 as part of his broader conjectures on the zeta functions of varieties over finite fields. These conjectures posit that the zeta function is rational, satisfies a functional equation involving the topological Euler characteristic, and that all non-trivial zeros lie on the "critical line" corresponding to absolute value \(q^{1/2}\) in the \(u\)-variable (or real part \(1/2\) in the logarithmic \(s = -\log(u)/\log(q)\) variable). Pierre Deligne proved these conjectures, including the Riemann hypothesis analogue, in 1974 using étale cohomology and the hard Lefschetz theorem.

This proven case extends beyond curves to zeta functions of higher-dimensional smooth projective varieties over \(\mathbb{F}_q\). For a variety \(V\) of dimension \(d\), the Weil zeta function factors into Euler products over cohomology groups, with the Riemann hypothesis analogue asserting that the eigenvalues of the geometric Frobenius on the étale cohomology \(H^r(V_{\overline{\mathbb{F}}_q}, \mathbb{Q}_\ell)\) have absolute value \(q^{r/2}\). For example, in hypersurfaces, the zeros of the zeta function lie on the critical hypersurface \(\mathrm{Re}(s) = d/2\) in the \(s\)-variable, providing a geometric realization of the hypothesis that contrasts with the unproven generalized Riemann hypothesis for number fields.

In positive characteristic, zeta functions arising from Drinfeld modules—analogues of elliptic curves twisted by the Frobenius endomorphism—also exhibit structures with Riemann hypothesis-like properties. These L-functions, defined via rank-one Drinfeld modules over function fields, satisfy functional equations and have conjectured zero loci on the critical line, mirroring the classical case but adapted to characteristic \(p \u003e 0\). Such analogues highlight the robustness of the hypothesis in arithmetic geometry over finite fields.

The proven Riemann hypothesis over function fields yields an analogue of the prime number theorem for counting points on varieties. Specifically, for a curve \(C\) over \(\mathbb{F}_q\), the number of points satisfies
\[
|C(\mathbb{F}_q)| = q + 1 + O(\sqrt{q}),
\]
with the error term bounded by \(2g \sqrt{q}\), enabling precise asymptotic estimates for point counts over field extensions akin to prime distribution in the integers.

## Proof Attempts and Approaches

### Classical and Operator-Theoretic Methods

Early efforts to prove the Riemann hypothesis focused on analytic techniques to establish zero-free regions for the Riemann zeta function \(\zeta(s)\) in the critical strip \(0 \u003c \Re(s) \u003c 1\). In 1896, Jacques Hadamard and Charles Jean de la Vallée Poussin independently demonstrated the prime number theorem by proving that \(\zeta(s)\) has no zeros in a strip \(\Re(s) \geq 1 - c / \log |t|\) for some constant \(c \u003e 0\) and large \(|t|\), where \(s = \sigma + it\). These zero-free regions to the right of the critical line \(\Re(s) = 1/2\) provided strong evidence for the distribution of primes but fell short of the hypothesis, as they did not exclude zeros off the line within the strip or confirm all non-trivial zeros lie exactly on \(\Re(s) = 1/2\). Their methods relied on integral representations and growth estimates of \(\zeta(s)\), highlighting the challenge of extending such regions to the full critical line without violating known properties of the function.

Subsequent classical approaches sought to directly verify zeros on the critical line using mollifier techniques, which introduce smoothing functions to isolate contributions from potential off-line zeros. In 1974, Norman Levinson developed a method employing a mollifier—a product of shifts of \(\zeta(s)\) weighted by Dirichlet polynomials—to show that at least one-third (approximately 34.1%) of the non-trivial zeros of \(\zeta(s)\) lie on the critical line up to height \(T\). By analyzing the second moment of \(\zeta(1/2 + it)\) with this mollifier and applying positivity arguments via the mean-value theorem for Dirichlet series, Levinson's approach demonstrated that the density of zeros off the line cannot exceed two-thirds asymptotically. However, the method's reliance on optimizing the mollifier's length and coefficients limited its reach, preventing a proof for the full proportion of one, and required assumptions about zero spacings that stopped short of the hypothesis.

Building on Levinson's framework, J. Brian Conrey refined the mollifier technique in 1989 by incorporating ratios of \(L\)-functions to enhance detection of critical-line zeros. This improvement established that more than two-fifths (at least 40.84%) of the zeros are on \(\Re(s) = 1/2\), achieved through a more sophisticated positivity kernel that better approximated the delta function at zeros. Conrey's use of ratios like \(\zeta'(s)/\zeta(s)\) allowed for finer control over the error terms in moment calculations, pushing the bound higher than Levinson's but still leaving a significant fraction unaccounted for, underscoring the limitations of purely analytic mollification in capturing all zeros without geometric or spectral insights. Subsequent refinements, including work by Bui, Conrey, and Young (2010) achieving over 41%, and Pratt, Robles, Zaharescu, and Zeindler (2019) reaching more than 5/12 (≈41.67%), have further increased this proportion using advanced mollifiers.

Shifting to operator-theoretic perspectives, the Hilbert-Pólya conjecture, originating in the early 20th century, posits that the non-trivial zeros of \(\zeta(s)\) correspond to the eigenvalues of some self-adjoint operator on a Hilbert space, which would ensure their imaginary parts are real and thus place them on the critical line. Attributed to David Hilbert's 1910 lectures and George Pólya's subsequent work on spectral theory, the idea draws from the observation that self-adjoint operators have real eigenvalues, mirroring the hypothesis's requirement for zeros at \(\Re(s) = 1/2\). Despite its appeal in linking number theory to quantum mechanics, no explicit operator has been constructed whose spectrum matches the zeros exactly, rendering the conjecture inspirational but unproven and insufficient for a full resolution.

A concrete attempt within this framework came in 1999 from Michael Berry and Jonathan Keating, who proposed quantizing the classical Hamiltonian \(H = xp\), where \(x\) and \(p = -i \hbar d/dx\) are position and momentum operators, to approximate the Riemann zeros semiclassically. The spectrum of this regularized operator yields eigenvalue asymptotics that align with the average spacing and density of the zeros, as derived from trace formulae akin to the Riemann-von Mangoldt explicit formula. 

\[
H = \frac{1}{2} (x p + p x)
\]

This symmetric form ensures self-adjointness, and numerical studies show its low-lying eigenvalues approximating the first few zeros, but discrepancies grow for higher ones due to the unbounded nature of the operator and lack of exact matching, falling short of proving the hypothesis by not reproducing the full spectrum precisely.

### Geometric and Modern Techniques

In the late 1990s, Alain Connes proposed an approach to the Riemann Hypothesis using noncommutative geometry, interpreting the critical zeros of the zeta function as an absorption spectrum within the noncommutative space of adele classes. This framework connects explicit formulas from number theory to a trace formula in noncommutative geometry, reducing the hypothesis to the validity of this trace formula by eliminating a parameter that previously obscured the spectral interpretation. Connes' method draws analogies between the geometry of adeles and the distribution of zeros, treating noncritical zeros as resonances, though it remains a speculative program requiring further development to yield a proof.

In 2018, Michael Atiyah claimed a proof of the Riemann Hypothesis using the Todd function, a weakly holomorphic entire function constructed via Hirzebruch's Riemann-Roch theory and linked to K-theoretic assembly maps on the complex numbers. He argued that the function's properties, including its relation to the fine structure constant and behavior under the functional equation of the zeta function, imply no zeros off the critical line, but the argument lacked rigorous details and was widely rejected by the mathematical community as incomplete and erroneous. The claim was effectively retracted following scrutiny, highlighting the challenges of bridging algebraic topology with analytic number theory in this context.

Connections between the Riemann Hypothesis and quasicrystals emerged in Freeman Dyson's 2009 analysis, where he observed that, assuming the hypothesis holds, the nontrivial zeros of the zeta function form a one-dimensional quasicrystal—a distribution of point masses with a Fourier transform yielding discrete frequencies, akin to aperiodic tilings in materials science. Dyson proposed that enumerating and classifying such quasicrystals could provide physical insights into the zero distribution, potentially leading to a proof by modeling the explicit formula's Poisson summation as diffraction patterns. Subsequent work by Peter Sarnak and collaborators extended this to Fourier quasicrystals via stable polynomials and metric graphs, exploring spectral properties that mirror the zeta zeros under the hypothesis, though these remain exploratory analogies without resolving the conjecture.

Efforts to embed the Riemann Hypothesis in proven geometric settings include models using zeta functions of arithmetic quotients of elliptic curves over finite fields, where the hypothesis is already established by Deligne's theorem. Don Zagier developed higher-rank zeta functions for elliptic curves, expressing them as products of shifts of the standard L-function and proving the Riemann Hypothesis for these via bounds on their coefficients, which align zeros on the critical line through functional equations and polynomial factorization. This approach seeks to generalize Weil's function field proof to number fields by embedding the zeta function into such geometric structures, offering a pathway to understand the conjecture via arithmetic geometry, albeit speculatively for the classical case.

Don Zagier's investigations into multiple zeta values highlight relations among these periods that could indirectly support the Riemann Hypothesis through motivic cohomology and algebraic structures. By establishing explicit evaluations and conjectures on linear independence—such as those resolved for repeated arguments—Zagier linked multiple zeta values to regulators and polylogarithms, suggesting a potential route via the arithmetic of periods where the hypothesis governs convergence and distribution properties. This perspective remains tentative, as it relies on unproven motivic conjectures to bridge multiple zeta values back to the single zeta function's zeros.

## Numerical Evidence and Zeros

### Location and Density of Zeros

The non-trivial zeros of the Riemann zeta function \(\zeta(s)\) all lie within the critical strip \(0 \u003c \Re(s) \u003c 1\). This fundamental result was established independently by Jacques Hadamard and Charles Jean de la Vallée Poussin in 1896, as part of their proofs of the prime number theorem, by demonstrating that \(\zeta(s)\) has no zeros on the line \(\Re(s) = 1\) and leveraging the functional equation to extend the zero-free region to the left boundary. Their work showed that any zero with \(\Re(s) \geq 1\) would contradict the non-vanishing of \(\zeta(s)\) in that half-plane, derived from contour integration and growth estimates of \(\zeta(s)\).

A precise asymptotic formula for the number of non-trivial zeros with imaginary part up to height \(T\), denoted \(N(T)\), is given by the Riemann-von Mangoldt formula:
\[
N(T) = \frac{T}{2\pi} \log \frac{T}{2\pi} - \frac{T}{2\pi} + O(\log T),
\]
where the error term accounts for minor oscillations near the real axis and the contribution from any potential zeros with small imaginary part. This formula, originally conjectured by Riemann in 1859 and rigorously proved by Hans von Mangoldt in 1905, counts the zeros \(\rho = \beta + i\gamma\) satisfying \(0 \u003c \Im(\rho) \leq T\) and arises from applying the argument principle to a rectangular contour enclosing the strip up to height \(T\), combined with detailed estimates of the change in \(\arg \zeta(s)\) along horizontal lines. It implies that the average density of zeros near height \(T\) is approximately \(\frac{1}{2\pi} \log \frac{T}{2\pi}\), providing an unconditional measure of how zeros accumulate vertically in the strip.

Results on the density of zeros on the critical line \(\Re(s) = 1/2\) offer partial support for the Riemann hypothesis by showing that a positive proportion lie there. In 1974, Norman Levinson proved that at least one-third (more precisely, greater than 34.74%) of the non-trivial zeros up to height \(T\) are on the critical line, using a mollifier technique to analyze ratios of \(\zeta(s)\) and its derivatives, which detects sign changes indicative of zeros. This bound was improved by J. Brian Conrey in 1989 to at least 40.88%, and further refined by Kyle Pratt, Nicolas Robles, Alexandru Zaharescu, and Dirk Zeindler in 2019 to greater than 5/12 (approximately 41.67%), employing refined moment estimates and combinatorial identities to strengthen the proportion of zeros on the line. These zero-density theorems rely on unconditional methods and highlight the critical line's prominence without assuming the hypothesis.

Gram points play a key role in locating and characterizing the zeros on the critical line through their relation to sign changes of \(\zeta(1/2 + it)\). Defined as the values \(t_n\) where the Hardy function \(Z(t) = \zeta(1/2 + it) e^{i \	heta(t)}\) (with \(\	heta(t)\) from the functional equation) satisfies \(Z(t_n) \u003e 0\) and changes sign between consecutive points, Gram points \(t_n\) approximate the ordinates of zeros, with the average spacing \(\Delta t_n \approx 2\pi / \log(t_n / 2\pi)\). Gram's law, observed empirically and largely verified, posits that zeros typically lie between consecutive Gram points, aiding in the enumeration and verification of zero crossings via the Riemann-Siegel formula. Exceptions to this law occur infrequently, with only a finite number known up to large heights, and they provide insights into deviations from the expected zero distribution.

Unconditional lower bounds on large gaps between consecutive zeros \(\gamma_n\) and \(\gamma_{n+1}\) (the ordinates on the critical line) demonstrate variability in zero spacings beyond the average \(\sim 2\pi / \log \gamma_n\). Using Jensen's formula applied to subharmonic functions like \(\log |\zeta(s)|\) in suitable disks, one obtains that there exist infinitely many gaps satisfying \(\gamma_{n+1} - \gamma_n \gg (\log \gamma_n \log \log \gamma_n \log \log \log \log \gamma_n) / \log \log \log \gamma_n\), as established in works building on earlier estimates by Littlewood and others. These bounds, derived from growth rates and the non-vanishing of \(\zeta(s)\) in certain regions, underscore the potential for significant deviations in zero clustering while remaining consistent with the overall density from the Riemann-von Mangoldt formula.

### Computational Verifications

In 1914, G. H. Hardy proved that the Riemann zeta function has infinitely many zeros on the critical line where the real part of the complex variable \(s\) is \(1/2\). This established a foundational result supporting the hypothesis, though it did not verify all non-trivial zeros lie there.

Early electronic computations began in the 1950s with Alan Turing, who used the Manchester Mark 1 computer to verify the first 1040 zeros of \(\zeta(s)\) on the critical line up to imaginary part approximately 1468, extending prior manual work by E. C. Titchmarsh. Turing's approach involved evaluating \(\zeta(1/2 + it)\) and applying an interval-checking method to ensure no zeros were missed between Gram points, where the argument change of the zeta function aligns with expected zero counts. This method, later formalized as Turing's method, confirms the completeness of zero lists in specified intervals by bounding the argument function \(S(t)\) and cross-verifying with the Riemann-von Mangoldt formula for zero density.

Modern verifications have scaled dramatically using optimized algorithms. In 2021, David J. Platt and Timothy Trudgian rigorously verified that the first approximately \(1.28 \	imes 10^{13}\) zeros (up to height \(3 \	imes 10^{12}\)) lie on the critical line, employing an enhanced version of the Odlyzko-Schönhage algorithm for fast evaluation of \(\zeta(1/2 + it)\). Central to these efforts is the Riemann-Siegel formula, which approximates \(\zeta(1/2 + it)\) with computational complexity \(O(t^{1/3})\) for large \(t\), allowing efficient summation over terms up to \(\sqrt{t}\). Andrew Odlyzko extended computations to high heights, verifying billions of zeros near \(t \approx 10^{22}\) and hundreds near \(t \approx 10^{32}\) with precision up to \(10^{-10}\), revealing statistical patterns consistent with random matrix theory predictions. As of 2025, no counterexamples to the hypothesis have emerged from these checks, including regions probed for potential anomalies related to the Skewes number, where sign changes in \(\pi(x) - \mathrm{Li}(x)\) were bounded under the assumption of the hypothesis. Moreover, all computed zeros are simple, as verified by non-vanishing derivatives \(\zeta'(\rho) \
eq 0\) at each zero \(\rho\).

## Philosophical and Broader Perspectives

### Arguments Supporting the Hypothesis

The statistical distribution of the spacings between the non-trivial zeros of the Riemann zeta function exhibits remarkable agreement with the predictions of random matrix theory, particularly the Gaussian Unitary Ensemble (GUE) model for large Hermitian matrices. This phenomenon, known as the Montgomery-Odlyzko law, posits that as the height \(T\) increases, the normalized spacings \(\delta_n = (\gamma_{n+1} - \gamma_n) \log \gamma_n / (2\pi)\) between consecutive zeros \(\rho_n = 1/2 + i\gamma_n\) (with \(0 \u003c \gamma_n \u003c T\)) follow the same distribution as the eigenvalue spacings in the GUE. This empirical observation, derived from extensive computations of zeta zeros, suggests a deep underlying structure akin to quantum chaotic systems, lending probabilistic support to the hypothesis that all non-trivial zeros lie on the critical line \(\Re(s) = 1/2\).

A key component of this evidence is Montgomery's pair correlation conjecture, which quantifies the distribution of differences between zeros. Specifically, it asserts that for large \(T\),

\[
\sum_{0 \u003c \gamma, \gamma' \leq T} \left( \frac{\sin(\pi (\gamma - \gamma') / \log T)}{\pi (\gamma - \gamma') / \log T} \right)^2 \sim T \log T \int_0^\infty \left(1 - \left( \frac{\sin(\pi u)}{\pi u} \right)^2 \right) (1 - u)_+ \, du,
\]

where \((1 - u)_+ = \max(1 - u, 0)\), indicating that the pair correlations of the zeta zeros mirror those of GUE eigenvalues for small normalized differences \(u \u003c 1\). This conjecture, supported by numerical verifications up to heights around \(10^{22}\), implies level repulsion among zeros consistent with the critical line placement under the Riemann hypothesis.

Physical analogies further bolster the hypothesis through the Hilbert-Pólya conjecture, which proposes that the imaginary parts of the zeta zeros correspond to the eigenvalues of a self-adjoint operator, akin to energy levels in quantum mechanics. In this framework, the zeros behave like the spectrum of a quantum Hamiltonian for a chaotic system, where semiclassical approximations predict eigenvalue distributions matching GUE statistics observed in the zeta function. Such connections, explored in models of quantum billiards and disordered systems, provide a heuristic rationale for the zeros' alignment on the critical line, as deviations would disrupt the expected chaotic spectral properties.

Probabilistic heuristics reinforce this by modeling the zeta function via random Euler products, where the phases in the product \(\zeta(s) = \prod_p (1 - p^{-s})^{-1}\) are treated as independent random variables uniformly distributed on the unit circle for \(\Re(s) \u003e 1/2\). This random model predicts that the logarithmic derivative \(\zeta'(s)/\zeta(s)\) has variance comparable to that on the critical line, and the probability of zeros off the line diminishes rapidly, supporting the hypothesis through moment calculations and tail estimates for the distribution of zeros.

The success of the Riemann hypothesis in analogous settings over function fields also strengthens belief in the number field case. In 1974, Deligne proved the analogue for the zeta functions of varieties over finite fields, showing that all non-trivial zeros lie on the critical line \(\Re(s) = 1/2\) in that context, using étale cohomology and the Weil conjectures. This resolution of the function field version, where explicit geometric interpretations facilitate proof, suggests that similar structural principles may underpin the classical zeta function, encouraging optimism for the original hypothesis.

### Potential Counterarguments and Challenges

Despite the extensive numerical evidence supporting the Riemann hypothesis, several mathematical results highlight potential obstacles and underscore the challenges in proving it. In 1914, J. E. Littlewood demonstrated unconditionally that the difference between the prime-counting function π(x) and the logarithmic integral li(x) changes sign infinitely often. This oscillation implies that π(x) surpasses li(x) for infinitely many x, challenging the intuitive notion under the Riemann hypothesis that li(x) consistently overestimates π(x), as the error term exhibits significant fluctuations independent of the hypothesis.

Littlewood's proof was ineffective, offering no explicit location for the first sign change. In 1933, Stanley Skewes addressed this by establishing an upper bound for the first such crossover, famously known as Skewes' number, on the order of 10^{10^{10^{34}}}. Subsequent refinements lowered this bound considerably; for instance, R. Sherman Lehman in 1966 achieved an effective estimate around 10^{1166}, H. J. J. te Riele in 1987 further reduced it to below 6.69 \	imes 10^{370}, and Saouter and te Riele in 2005 improved it to approximately 1.4 \	imes 10^{316}. These improvements, relying on explicit computations of zeta zeros, illustrate the practical difficulties in pinpointing the scale of deviations from the expected prime distribution, even if the Riemann hypothesis holds.

Additional challenges arise from omega results concerning the growth of the zeta function on the critical line. In 1936, A. E. Ingham established that |\zeta(1/2 + it)| = \Omega \left( \exp(c (\log t)^{1/2}) \right) for some constant c \u003e 0, indicating that the zeta function attains exceptionally large values infinitely often along the line Re(s) = 1/2. Although consistent with the Riemann hypothesis, which predicts an upper bound of O(t^{1/2 + \epsilon}) under the assumption, this lower bound underscores the potential for large contributions from zeros that could complicate analytic continuation or moment estimates, posing hurdles to proof strategies reliant on bounded growth.

No nontrivial zeros off the critical line have been discovered, with all known zeros up to the 10^{36}-th zero (heights exceeding 10^{36}) lying on Re(s) = 1/2, as verified through high-precision computations. However, the immense expanse beyond this—spanning heights up to infinity—remains computationally inaccessible, leaving open the possibility of counterexamples in unexplored regions that could falsify the hypothesis. Furthermore, while the Riemann hypothesis implies strong results for prime distribution, analogous generalized versions for Dirichlet L-functions (GRH) encounter contextual limitations; for example, certain prime races or Chebyshev biases persist unconditionally in ways that GRH would suppress, highlighting broader difficulties in extending the hypothesis across number fields.

Philosophically, the Riemann hypothesis's status as a "natural" conjecture—deeply intertwined with prime distribution yet resistant to proof—has led some to invoke Gödel's incompleteness theorems, suggesting it might be true but independent of Zermelo-Fraenkel set theory with choice (ZFC), rendering it unprovable within standard axioms. Alternatively, critics view it as potential empirical overreach, extrapolating from finite verifications to an untestable universal claim without foundational justification. These perspectives emphasize the hypothesis's foundational challenges beyond mere computation or analysis.