// Age Verification Circuit
// Proves that a person is at least 18 years old without revealing their actual age
// 
// Private inputs (not revealed in proof):
// - birth_year: The year of birth (e.g., 1990)
// - birth_month: The month of birth (1-12)
// - birth_day: The day of birth (1-31)
//
// Public inputs (revealed in proof):
// - current_year: The current year (e.g., 2024)
// - current_month: The current month (1-12)
// - current_day: The current day (1-31)
// - min_age: The minimum age required (e.g., 18)

fn main(
    birth_year: u32,
    birth_month: u32,
    birth_day: u32,
    current_year: pub u32,
    current_month: pub u32,
    current_day: pub u32,
    min_age: pub u32,
) {
    // Validate birth date inputs
    assert(birth_month >= 1);
    assert(birth_month <= 12);
    assert(birth_day >= 1);
    assert(birth_day <= 31);

    // Validate current date inputs
    assert(current_month >= 1);
    assert(current_month <= 12);
    assert(current_day >= 1);
    assert(current_day <= 31);

    // Calculate the base age (years difference)
    let base_age = current_year - birth_year;

    // Determine if birthday has occurred this year
    // Birthday has passed if:
    // - current month is greater than birth month, OR
    // - current month equals birth month AND current day >= birth day
    let month_passed = current_month > birth_month;
    let same_month_day_passed = (current_month == birth_month) & (current_day >= birth_day);
    let birthday_passed = month_passed | same_month_day_passed;

    // Calculate actual age
    // If birthday hasn't passed this year, subtract 1 from base age
    let age = if birthday_passed { base_age } else { base_age - 1 };

    // Assert that the person is at least min_age years old
    assert(age >= min_age);
}

#[test]
fn test_adult_birthday_passed() {
    // Person born on Jan 15, 1990, current date Dec 1, 2024
    // Age should be 34 (birthday has passed)
    main(1990, 1, 15, 2024, 12, 1, 18);
}

#[test]
fn test_adult_birthday_not_passed() {
    // Person born on Dec 15, 1990, current date Dec 1, 2024
    // Age should be 33 (birthday hasn't passed yet)
    main(1990, 12, 15, 2024, 12, 1, 18);
}

#[test]
fn test_exactly_18() {
    // Person born on Jan 1, 2006, current date Jan 1, 2024
    // Age is exactly 18
    main(2006, 1, 1, 2024, 1, 1, 18);
}

#[test]
fn test_just_turned_18() {
    // Person born on Nov 30, 2006, current date Dec 1, 2024
    // Age is 18 (just turned 18 yesterday)
    main(2006, 11, 30, 2024, 12, 1, 18);
}

#[test(should_fail)]
fn test_under_18_fail() {
    // Person born on Jan 1, 2007, current date Dec 1, 2024
    // Age is 17 - should fail
    main(2007, 1, 1, 2024, 12, 1, 18);
}

#[test(should_fail)]
fn test_almost_18_fail() {
    // Person born on Dec 15, 2006, current date Dec 1, 2024
    // Age is still 17 (birthday hasn't passed) - should fail
    main(2006, 12, 15, 2024, 12, 1, 18);
}
